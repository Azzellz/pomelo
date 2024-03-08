import axios from "axios";
import { parseStringPromise } from "xml2js";
import { readFile, writeFile } from "fs/promises";
import { DownloadOption } from "./models/rule";
import { Config } from "./models/config";

export async function postDownloadRequest(
    config: Config,
    uri: string,
    opts: DownloadOption
) {
    const data = {
        jsonrpc: "2.0",
        method: "aria2.addUri",
        id: "pomelo-aria2-" + Date.now(),
        params: [
            `token:${opts.token || config.aria2.token}`,
            [uri],
            { dir: opts.dir },
        ],
    };
    const url = `${opts.host || config.aria2.host}:${
        opts.port || config.aria2.port
    }/jsonrpc`;

    return axios.post(url, data);
}

export async function getRSS<RSSType>(option: Config["rss"]): Promise<RSSType> {
    try {
        if (option.uri.includes("http") || option.uri.includes("https")) {
            //远程下载rss
            const { data } = await axios.get(option.uri);
            option.save && writeFile(option.save, data);
            return await parseStringPromise(data as string);
        } else {
            //本地加载rss
            return await parseStringPromise(readFile(option.uri));
        }
    } catch (error) {
        throw "Failed to get RSS feed, please check uri!";
    }
}
