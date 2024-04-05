import { RuleMap } from "./rule";

export interface Config {
    interval?: number | string;
    record?: {
        expire: number | string;
    };
    resource: {
        type: "rss-mikanani" | "rss-nyaa" | "rss-share-acgnx" | "other";
        url: string;
        parser?: (
            json: object,
            handler: (content: string, link: string) => void
        ) => void;
    };
    aria2: {
        env: boolean;
        host: string;
        port: string;
        token: string;
    };
    rules: RuleMap;
}

// export interface OriginConfig {
//     interval?: number | string;
//     record?: {
//         expire: number | string;
//     };
//     resource: {
//         type: "rss-mikanani" | "rss-nyaa" | "rss-share-acgnx" | "other";
//         url: string;
//         parser?: (
//             json: object,
//             handler: (content: string, link: string) => void
//         ) => void;
//     };
//     aria2: {
//         env: boolean;
//         host: string;
//         port: string;
//         token: string;
//     };
//     rules: RuleMap;
// }
