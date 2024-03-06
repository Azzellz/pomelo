import axios from "axios";
const host = "127.0.0.1";
const port = "6800";
const token = "";
export function createDownload(uri: string, opts: { dir: string }) {
    const data = {
        jsonrpc: "2.0",
        method: "aria2.addUri",
        id: "qwer",
        params: [`token:${token}`, [uri], opts],
    };
    return axios.post(`http://${host}:${port}/jsonrpc`, data);
}
