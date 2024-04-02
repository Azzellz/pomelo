import { RuleMap } from "./rule";

export interface Config {
    interval?: number | string;
    record?: {
        expire: number;
    };
    resource: {
        type: "rss-mikanani" | "rss-nyaa" | "rss-share-acgnx" | "other";
        url: string;
        parser?: (
            target: object,
            handler: (content: string, link: string) => void
        ) => void;
    };
    aria2: {
        host: string;
        port: string;
        token: string;
    };
    rules: RuleMap;
}
