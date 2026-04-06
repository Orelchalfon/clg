import { fetchLeads } from "@/lib/google-places";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

        if (!Number.isFinite(desiredAmount) || desiredAmount < 1 || desiredAmount > 100) {
            return NextResponse.json(
                { error: "desiredAmount must be between 1 and 100" },
                { status: 400 },
            );
        }

        const leads = await fetchLeads({
            businessType,
            desiredAmount,
        });

        return NextResponse.json({ leads });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unexpected server error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}