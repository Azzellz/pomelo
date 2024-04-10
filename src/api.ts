import { parseStringPromise } from "xml2js";
import { readFile } from "fs/promises";
import { PomeloDownloadOption } from "./models/rule";
import { Config } from "./models/config";
import { resolve } from "path";

export async function postDownloadRequest(
    config: Config,
    link: string,
    opts: PomeloDownloadOption,
    ruleName: string
) {
    let token = process.env["POMELO_ARIA2_TOKEN"];
    let host = process.env["POMELO_ARIA2_HOST"];
    let port = process.env["POMELO_ARIA2_PORT"];
    token = opts.token || config.aria2.token || token;
    host = opts.host || config.aria2.host || host;
    port = opts.port || config.aria2.port || port;
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

//获取并且解析资源,返回一个合法的js对象
export async function getResource(
    options: Config["resource"]
): Promise<object> {
    try {
        if (options.url.includes("http") || options.url.includes("https")) {
            //远程下载
            const res = await fetch(options.url);
            return await parseStringPromise(await res.text());
        } else {
            //本地加载
            const buf = await readFile(resolve(options.url));
            const _tmp = options.url.split(".");
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
