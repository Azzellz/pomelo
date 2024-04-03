import { parseStringPromise } from "xml2js";
import { readFile } from "fs/promises";
import { DownloadOption } from "./models/rule";
import { Config } from "./models/config";
import { resolve } from "path";
import { loadEnv } from "./util";

export async function postDownloadRequest(
    config: Config,
    link: string,
    opts: DownloadOption,
    ruleName: string
) {
    let token: string = "";
    let host: string = "";
    let port: string = "";
    if (config.aria2.env) {
        token = await loadEnv("POMELO_ARIA2_TOKEN");
        host = await loadEnv('POMELO_ARIA2_HOST')
        port = await loadEnv('POMELO_ARIA2_PORT')
    }
    token = opts.token || config.aria2.token || token;
    host = opts.host || config.aria2.host || host;
    port = opts.port || config.aria2.port || host;
    const url = `${host}:${port}/jsonrpc`;

    const dir = opts.dir.replaceAll("{{rule.name}}", ruleName);
    const data = {
        jsonrpc: "2.0",
        method: "aria2.addUri",
        id: "pomelo-aria2-" + Date.now(),
        params: [`token:${token}`, [link], { dir }],
    };

    return fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getResource(
    resourceOpt: Config["resource"]
): Promise<any> {
    try {
        if (
            resourceOpt.url.includes("http") ||
            resourceOpt.url.includes("https")
        ) {
            //远程下载
            const res = await fetch(resourceOpt.url);
            return await parseStringPromise(await res.text());
        } else {
            //本地加载
            const buf = await readFile(resolve(resourceOpt.url));
            const _tmp = resourceOpt.url.split(".");
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
