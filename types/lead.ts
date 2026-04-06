export type Lead = {
    id: string;
    businessType: string;
    clientName: string;
    clientPhone: string;
    email: string;
    hasWebsite: boolean;
    websiteUrl: string;
};

export type LeadSearchProgress = {
    type: "progress";
    queryLabel: string;
    completedQueries: number;
    totalQueries: number;
    scannedCount: number;
    leadCount: number;
};

export type LeadSearchLeadEvent = {
    type: "lead";
    lead: Lead;
};

export type LeadSearchDoneEvent = {
    type: "done";
    leadsFound: number;
    completed: boolean;
};

export type LeadSearchErrorEvent = {
    type: "error";
    message: string;
};

export type LeadSearchStreamEvent =
    | LeadSearchProgress
    | LeadSearchLeadEvent
    | LeadSearchDoneEvent
    | LeadSearchErrorEvent;
