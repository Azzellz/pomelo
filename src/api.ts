import axios from "axios";
import { Config, DownloadOption, Resource } from "./model";
import { parseStringPromise } from "xml2js";
import config from "../pomelo.json";
import { readFile, writeFile } from "fs/promises";

export async function postDownloadRequest(uri: string, opts: DownloadOption) {
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

export async function getRSS(option: Config["rss"]): Promise<Resource> {
    try {
        if (option.uri.includes("http") || option.uri.includes("https")) {
            const { data } = await axios.get(option.uri);
            option.save && writeFile(option.save, data);
            return await parseStringPromise(data as string);
        } else {
            return await parseStringPromise(readFile(option.uri));
        }
    } catch (error) {
        throw "Failed to get RSS feed, please check uri!";
    }
}
