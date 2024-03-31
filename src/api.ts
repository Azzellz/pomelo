import { parseStringPromise } from "xml2js";
import { readFile } from "fs/promises";
import { DownloadOption } from "./models/rule";
import { Config } from "./models/config";
import { SupportRSS } from "./models/common-rss";
import path from "node:path";

export async function postDownloadRequest(
    config: Config,
    uri: string,
    opts: DownloadOption,
    ruleName: string
) {
    const token = opts.token || config.aria2.token;
    const dir = opts.dir.replaceAll("{{rule.name}}", ruleName);
    const data = {
        jsonrpc: "2.0",
        method: "aria2.addUri",
        id: "pomelo-aria2-" + Date.now(),
        params: [`token:${token}`, [uri], { dir }],
    };
    const host = opts.host || config.aria2.host;
    const port = opts.port || config.aria2.port;
    const url = `${host}:${port}/jsonrpc`;

    return fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getRSS<T extends SupportRSS>(
    option: Config["rss"]
): Promise<T> {
    try {
        if (option.uri.includes("http") || option.uri.includes("https")) {
            //远程下载rss
            const res = await fetch(option.uri);
            return await parseStringPromise(await res.text());
        } else {
            //本地加载rss
            const buf = await readFile(path.join(__dirname, option.uri));
            const _tmp = option.uri.split(".");
            const suffix = _tmp[_tmp.length - 1];
            if (suffix === "xml") {
                return await parseStringPromise(buf.toString());
            } else if (suffix === "json") {
                return JSON.parse(buf.toString());
            } else {
                throw "Wrong local file extension";
            }
        }
    } catch (error) {
        throw "Failed to get RSS feed, please check uri!";
    }
}
