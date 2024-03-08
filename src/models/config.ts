import { RuleMap } from "./rule";

export interface Config {
    interval: number | string;
    baseUrl: string;
    rss: {
        uri: string;
        save?: string;
    };
    aria2: {
        host: string;
        port: string;
        token: string;
    };
    rules: RuleMap;
}
