import { SupportRSSUrl } from "./common-rss";
import { RuleMap } from "./rule";

export interface Config {
    interval: number | string;
    rss: {
        uri: SupportRSSUrl;
    };
    aria2: {
        host: string;
        port: string;
        token: string;
    };
    rules: RuleMap;
}
