import type { Lead, LeadSearchProgress, LeadSearchStreamEvent } from "@/types/lead";
import { randomUUID } from "node:crypto";

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const RTL_MARK = "\u200F";
const GOOGLE_PAGE_TOKEN_DELAY_MS = 2_000;
const MAX_UNPRODUCTIVE_PAGES_PER_QUERY = 2;

const DEFAULT_CITY_QUERIES = [
    "בישראל",
    "בתל אביב",
    "בירושלים",
    "בחיפה",
    "בראשון לציון",
    "בפתח תקווה",
    "באשדוד",
    "בנתניה",
    "בבאר שבע",
    "בחולון",
    "ברמת גן",
    "ברחובות",
    "באשקלון",
    "בהרצליה",
    "בכפר סבא",
] as const;

type GooglePlace = {
    displayName?: { text?: string };
    websiteUri?: string;
    nationalPhoneNumber?: string;
};

type GooglePlacesResponse = {
    places?: GooglePlace[];
    nextPageToken?: string;
};

type SearchPlacesParams = {
    query: string;
    pageToken?: string;
    apiKey: string;
    signal?: AbortSignal;
};

export type StreamLeadsSearchParams = {
    businessType: string;
    desiredAmount: number;
    onEvent: (event: LeadSearchStreamEvent) => void | Promise<void>;
    signal?: AbortSignal;
};

const forceRtl = (value: string): string => {
    if (!value.trim()) return value;
    return `${RTL_MARK}${value}`;
};

const normalizeWhitespace = (value: string): string =>
    value.trim().replace(/\s+/g, " ");

const normalizeForDedupe = (value: string): string =>
    normalizeWhitespace(value.replaceAll(RTL_MARK, "")).toLocaleLowerCase("he-IL");

const createAbortError = (): Error => {
    const error = new Error("The operation was aborted.");
    error.name = "AbortError";
    return error;
};

const throwIfAborted = (signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw createAbortError();
    }
};

const wait = (durationMs: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(createAbortError());
            return;
        }

        const timeoutId = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, durationMs);

        const onAbort = () => {
            clearTimeout(timeoutId);
            reject(createAbortError());
        };

        signal?.addEventListener("abort", onAbort, { once: true });
    });

const searchPlaces = async ({
    query,
    pageToken,
    apiKey,
    signal,
}: SearchPlacesParams): Promise<GooglePlacesResponse> => {
    const response = await fetch(TEXT_SEARCH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": [
                "places.displayName",
                "places.websiteUri",
                "places.nationalPhoneNumber",
                "nextPageToken",
            ].join(","),
        },
        body: JSON.stringify({
            textQuery: query,
            pageSize: 20,
            languageCode: "he",
            ...(pageToken ? { pageToken } : {}),
        }),
        cache: "no-store",
        signal,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google Places error: ${response.status} ${text}`);
    }

    return response.json();
};

const createLead = (businessType: string, place: GooglePlace): Lead | null => {
    const clientName = place.displayName?.text?.trim() ?? "";
    const websiteUrl = place.websiteUri?.trim() ?? "";
    const clientPhone = place.nationalPhoneNumber?.trim() ?? "";

    if (!clientName || websiteUrl) {
        return null;
    }

    return {
        id: randomUUID(),
        businessType: forceRtl(businessType),
        clientName: forceRtl(clientName),
        clientPhone,
        email: "",
        hasWebsite: false,
        websiteUrl: "",
    };
};

const emitProgress = async (
    onEvent: StreamLeadsSearchParams["onEvent"],
    progress: Omit<LeadSearchProgress, "type">,
) => {
    await onEvent({
        type: "progress",
        ...progress,
    });
};

export const getLeadSearchKey = (
    businessType: string,
    desiredAmount: number,
): string => `${normalizeWhitespace(businessType).toLocaleLowerCase("he-IL")}::${desiredAmount}`;

export async function streamLeadsSearch({
    businessType,
    desiredAmount,
    onEvent,
    signal,
}: StreamLeadsSearchParams): Promise<void> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GOOGLE_MAPS_API_KEY");
    }

    const normalizedBusinessType = normalizeWhitespace(businessType);
    const queries = DEFAULT_CITY_QUERIES.map(
        (suffix) => `${normalizedBusinessType} ${suffix}`,
    );

    const seen = new Set<string>();
    let scannedCount = 0;
    let leadCount = 0;
    let completedQueries = 0;

    await emitProgress(onEvent, {
        queryLabel: queries[0] ?? normalizedBusinessType,
        completedQueries,
        totalQueries: queries.length,
        scannedCount,
        leadCount,
    });

    for (const query of queries) {
        throwIfAborted(signal);

        if (leadCount >= desiredAmount) {
            break;
        }

        let nextPageToken: string | undefined;
        let consecutiveUnproductivePages = 0;

        while (leadCount < desiredAmount) {
            throwIfAborted(signal);

            const data = await searchPlaces({
                query,
                pageToken: nextPageToken,
                apiKey,
                signal,
            });

            const places = data.places ?? [];
            scannedCount += places.length;

            if (!places.length) {
                await emitProgress(onEvent, {
                    queryLabel: query,
                    completedQueries,
                    totalQueries: queries.length,
                    scannedCount,
                    leadCount,
                });
                break;
            }

            let acceptedFromPage = 0;

            for (const place of places) {
                throwIfAborted(signal);

                const clientName = place.displayName?.text?.trim() ?? "";
                const clientPhone = place.nationalPhoneNumber?.trim() ?? "";

                if (!clientName) {
                    continue;
                }

                const dedupeKey = `${normalizeForDedupe(clientName)}::${normalizeForDedupe(clientPhone)}`;
                if (seen.has(dedupeKey)) {
                    continue;
                }

                seen.add(dedupeKey);

                const lead = createLead(normalizedBusinessType, place);
                if (!lead) {
                    continue;
                }

                acceptedFromPage += 1;
                leadCount += 1;
                await onEvent({ type: "lead", lead });

                if (leadCount >= desiredAmount) {
                    break;
                }
            }

            consecutiveUnproductivePages =
                acceptedFromPage === 0 ? consecutiveUnproductivePages + 1 : 0;

            nextPageToken = data.nextPageToken;

            await emitProgress(onEvent, {
                queryLabel: query,
                completedQueries,
                totalQueries: queries.length,
                scannedCount,
                leadCount,
            });

            if (!nextPageToken || leadCount >= desiredAmount) {
                break;
            }

            if (consecutiveUnproductivePages >= MAX_UNPRODUCTIVE_PAGES_PER_QUERY) {
                break;
            }

            await wait(GOOGLE_PAGE_TOKEN_DELAY_MS, signal);
        }

        completedQueries += 1;

        await emitProgress(onEvent, {
            queryLabel: query,
            completedQueries,
            totalQueries: queries.length,
            scannedCount,
            leadCount,
        });
    }

    await onEvent({
        type: "done",
        leadsFound: leadCount,
        completed: true,
    });
}
