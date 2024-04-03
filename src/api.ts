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
    const token = (opts.token || config.aria2.token).replaceAll(
        "$ARIA2_TOKEN",
        await loadEnv("ARIA2_TOKEN")
    );
    const host = (opts.host || config.aria2.host).replaceAll(
        "$ARIA2_HOST",
        await loadEnv("ARIA2_HOST")
    );
    const port = (opts.port || config.aria2.port).replaceAll(
        "$ARIA2_PORT",
        await loadEnv("ARIA2_PORT")
    );
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
