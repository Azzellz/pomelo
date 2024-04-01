export interface PomeloRecord {
    accepted: Record<string, RecordUnit | undefined>;
    rejected: Record<string, RecordUnit | undefined>;
}

export interface RecordUnit {
    expired?: number | false;
}
