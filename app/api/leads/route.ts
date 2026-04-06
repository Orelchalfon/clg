import { getLeadSearchKey, streamLeadsSearch } from "@/lib/google-places";
import type { LeadSearchStreamEvent } from "@/types/lead";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();
const activeSearches = new Map<string, SearchSession>();

type StreamListener = (chunk: string) => void;

type SearchSession = {
    history: string[];
    listeners: Set<StreamListener>;
    abortController: AbortController;
    isClosed: boolean;
};

const toChunk = (event: LeadSearchStreamEvent): string =>
    `${JSON.stringify(event)}\n`;

const isAbortError = (error: unknown): boolean =>
    error instanceof Error && error.name === "AbortError";

const createSearchSession = (
    key: string,
    businessType: string,
    desiredAmount: number,
): SearchSession => {
    const session: SearchSession = {
        history: [],
        listeners: new Set<StreamListener>(),
        abortController: new AbortController(),
        isClosed: false,
    };

    const publish = (event: LeadSearchStreamEvent) => {
        if (session.isClosed) {
            return;
        }

        const chunk = toChunk(event);
        session.history.push(chunk);

        for (const listener of session.listeners) {
            listener(chunk);
        }
    };

    const close = () => {
        if (session.isClosed) {
            return;
        }

        session.isClosed = true;
        activeSearches.delete(key);

        for (const listener of session.listeners) {
            listener("");
        }

        session.listeners.clear();
    };

    void streamLeadsSearch({
        businessType,
        desiredAmount,
        signal: session.abortController.signal,
        onEvent: async (event) => {
            publish(event);
        },
    })
        .catch((error) => {
            if (!isAbortError(error)) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unexpected server error";

                publish({ type: "error", message });
            }
        })
        .finally(() => {
            close();
        });

    return session;
};

const getOrCreateSearchSession = (
    businessType: string,
    desiredAmount: number,
): SearchSession => {
    const key = getLeadSearchKey(businessType, desiredAmount);
    const existingSession = activeSearches.get(key);

    if (existingSession && !existingSession.isClosed) {
        return existingSession;
    }

    const session = createSearchSession(key, businessType, desiredAmount);
    activeSearches.set(key, session);
    return session;
};

const closeStreamController = (
    controller: ReadableStreamDefaultController<Uint8Array>,
) => {
    try {
        controller.close();
    } catch {}
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const businessType = String(body.businessType ?? "").trim();
        const desiredAmount = Number(body.desiredAmount ?? 0);

        if (!businessType) {
            return NextResponse.json(
                { error: "businessType is required" },
                { status: 400 },
            );
        }

        if (
            !Number.isFinite(desiredAmount) ||
            desiredAmount < 1 ||
            desiredAmount > 100
        ) {
            return NextResponse.json(
                { error: "desiredAmount must be between 1 and 100" },
                { status: 400 },
            );
        }

        const session = getOrCreateSearchSession(businessType, desiredAmount);

        const stream = new ReadableStream<Uint8Array>({
            start(controller) {
                let isActive = true;

                const listener: StreamListener = (chunk) => {
                    if (!isActive) {
                        return;
                    }

                    if (!chunk) {
                        closeStreamController(controller);
                        return;
                    }

                    controller.enqueue(encoder.encode(chunk));
                };

                for (const chunk of session.history) {
                    listener(chunk);
                }

                if (session.isClosed) {
                    closeStreamController(controller);
                    return;
                }

                session.listeners.add(listener);

                const cleanup = () => {
                    if (!isActive) {
                        return;
                    }

                    isActive = false;
                    session.listeners.delete(listener);

                    if (!session.isClosed && session.listeners.size === 0) {
                        session.abortController.abort();
                    }
                };

                request.signal.addEventListener("abort", cleanup, { once: true });
            },
            cancel() {},
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "application/x-ndjson; charset=utf-8",
                "Cache-Control": "no-store, no-transform",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unexpected server error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
