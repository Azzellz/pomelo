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
