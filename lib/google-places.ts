import type { Lead } from "@/types/lead";
import { randomUUID } from "node:crypto";

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const RTL_MARK = "\u200F";

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
];

type GooglePlace = {
    displayName?: { text?: string };
    websiteUri?: string;
    nationalPhoneNumber?: string;
};

type GooglePlacesResponse = {
    places?: GooglePlace[];
    nextPageToken?: string;
};

const forceRtl = (value: string): string => {
    if (!value.trim()) return value;
    return `${RTL_MARK}${value}`;
};

const searchPlaces = async ({
    query,
    pageToken,
    apiKey,
}: {
    query: string;
    pageToken?: string;
    apiKey: string;
}): Promise<GooglePlacesResponse> => {
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
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google Places error: ${response.status} ${text}`);
    }

    return response.json();
};

export const fetchLeads = async ({
    businessType,
    desiredAmount,
}: {
    businessType: string;
    desiredAmount: number;
}): Promise<Lead[]> => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GOOGLE_MAPS_API_KEY");
    }

    const rows: Lead[] = [];
    const seen = new Set<string>();

    const queries = DEFAULT_CITY_QUERIES.map(
        (suffix) => `${businessType} ${suffix}`,
    );

    for (const query of queries) {
        if (rows.length >= desiredAmount) break;

        let nextPageToken: string | undefined;

        while (rows.length < desiredAmount) {
            const data = await searchPlaces({
                query,
                pageToken: nextPageToken,
                apiKey,
            });

            const places = data.places ?? [];
            nextPageToken = data.nextPageToken;

            if (!places.length) break;

            for (const place of places) {
                const clientName = place.displayName?.text?.trim() ?? "";
                const websiteUrl = place.websiteUri ?? "";
                const clientPhone = place.nationalPhoneNumber ?? "";

                if (!clientName) continue;

                const dedupeKey = `${clientName.toLowerCase()}::${clientPhone}`;
                if (seen.has(dedupeKey)) continue;
                seen.add(dedupeKey);

                if (!websiteUrl) {
                    rows.push({
                        id: randomUUID(),
                        businessType: forceRtl(businessType),
                        clientName: forceRtl(clientName),
                        clientPhone,
                        email: "",
                        hasWebsite: false,
                        websiteUrl: "",
                    });
                }

                if (rows.length >= desiredAmount) break;
            }

            if (!nextPageToken) break;

            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }

    return rows;
};