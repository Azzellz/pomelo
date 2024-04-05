import { Config } from "../models/config";
//checker
export function checkConfig(config: Config) {
    try {
        const { interval, resource } = config;
        //检查interval
        if (interval && typeof interval === "string") {
            switch (interval[interval.length - 1]) {
                case "s":
                case "m":
                case "h":
                case "d":
                    break;
                default:
                    throw "string interval configuration items must end with the characters s (seconds), m (minutes), h (hours), d (days)";
            }
        }
        //检查resource
        if (resource) {
            if (!resource.url)
                throw "resource.url is a required configuration item";
            if (!resource.type) {
                throw "resource.type is a required configuration item, you can use rss-mikanani | rss-nyaa | rss-share-acgnx | other";
            }
            if (
                resource.type !== "rss-mikanani" &&
                resource.type !== "rss-nyaa" &&
                resource.type !== "rss-share-acgnx" &&
                resource.type !== "other"
            ) {
                throw "resource.type must be rss-mikanani | rss-nyaa | rss-share-acgnx | other";
            }
            if (resource.parser && typeof resource.parser !== "function") {
                throw "resource.parser must be a canonically signed function";
            }
        } else {
            throw "resource is a required configuration item";
        }
        return config;
    } catch (error) {
        throw "error in checkConfig: " + error;
    }
}
