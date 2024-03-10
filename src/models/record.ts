export interface PomeloRecord {
    accepted: Record<string, RecordUnit | undefined>;
    rejected: Record<string, RecordUnit | undefined>;
}

interface RecordUnit {
    expired: number;
}
