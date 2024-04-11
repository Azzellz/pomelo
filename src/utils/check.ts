import { PomeloConfig } from "../models/config";
//checker
export function checkConfig(config: PomeloConfig) {
    try {
        const { interval, resource, record, aria2 } = config;
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
            if (resource.worker && typeof resource.worker !== "function") {
                throw "resource.parser must be a canonically signed function";
            }
        } else {
            throw "resource is a required configuration item";
        }
        //检查record
        if (record) {
        }
        //检查aria2
        if (aria2) {
            if (typeof aria2.env !== "boolean") {
                throw "aria2.env must be boolean";
            }
            if (aria2.host && !/https?:\\/.test(aria2.host)) {
                throw "aria2.host must be https or http protocols";
            }
            if (
                (aria2.port &&
                    !parseInt(aria2.port) &&
                    parseInt(aria2.port) < 0) ||
                parseInt(aria2.port) > 65535
            ) {
                throw "invalid aria2.port";
            }
            if (aria2.token) {
            }
        }
        return config;
    } catch (error) {
        throw "error in checkConfig: " + error;
    }
}
