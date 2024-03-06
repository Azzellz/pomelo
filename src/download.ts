import axios from "axios";
import { DownloadOption } from "./model";
import config from "../pomelo.json";

export function createDownload(uri: string, opts: DownloadOption) {
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
    const url = `http://${opts.host || config.aria2.host}:${
        opts.port || config.aria2.port
    }/jsonrpc`;

    return axios.post(url, data);
}
