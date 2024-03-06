import axios from "axios";
import { DownloadOption } from "./model";
const host = "127.0.0.1";
const port = "6800";
const token = "";

export function createDownload(uri: string, opts: DownloadOption) {
    const data = {
        jsonrpc: "2.0",
        method: "aria2.addUri",
        id: "pomelo-aria2-" + Date.now(),
        params: [`token:${opts.token || token}`, [uri], { dir: opts.dir }],
    };
    const url = `http://${opts.host || host}:${opts.port || port}/jsonrpc`;

    return axios.post(url, data);
}
