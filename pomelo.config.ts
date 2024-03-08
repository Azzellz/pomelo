export default {
    interval: 0,
    baseUrl: "../",
    rss: {
        uri: "https://mikanani.me/RSS/Classic",
        save: "",
    },
    aria2: {
        host: "http://127.0.0.1",
        port: "6800",
        token: "",
    },
    rules: {
        葬送的芙莉莲: {
            option: {
                dir: "/downloads/连载/葬送的芙莉莲",
            },
            accept: [
                ["Frieren", "Baha", "gj\\.y"],
                ["Frieren", "LoliHouse"],
            ],
            reject: [["sp|ova|oad|special|特別"]],
        },
        "公主殿下，「拷问」的时间到了": {
            option: {
                dir: "/downloads/连载/公主殿下，「拷问」的时间到了",
            },
            accept: [
                ["o jikan des", "Baha", "gj\\.y"],
                ["o jikan des", "LoliHouse"],
            ],
            reject: [["sp|ova|oad|special|特別"]],
        },
        我独自升级: {
            option: {
                dir: "/downloads/连载/我独自升级",
            },
            accept: [
                ["re dake level up na ke", "Baha", "gj\\.y"],
                ["re dake level up na ke", "LoliHouse"],
            ],
            reject: [["sp|ova|oad|special|特別"]],
        },
    },
};
