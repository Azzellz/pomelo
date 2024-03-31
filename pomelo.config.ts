export default {
    interval: "19s",
    record: {},
    rss: {
        uri: "https://mikanani.me/RSS/Classic",
    },
    aria2: {
        host: "http://127.0.0.1",
        port: "6800",
        token: "",
    },
    rules: {
        葬送的芙莉莲: {
            option: {
                dir: "/downloads/连载/{{rule.name}}",
            },
            // accept: (content: string) => content.includes("Frieren"),
            accept: "Frieren",
            reject: (content: string) =>
                /sp(?!a)|ova|oad|special|特別/.test(content),
        },
        "公主殿下，「拷问」的时间到了": {
            option: {
                dir: "/downloads/连载/公主殿下，「拷问」的时间到了",
            },
            accept: [
                ["o jikan des", "Baha", "gj\\.y"],
                ["o jikan des", "LoliHouse"],
            ],
            reject: [["sp(?!a)|ova|oad|special|特別"]],
        },
        我独自升级: {
            option: {
                dir: "/downloads/连载/我独自升级",
            },
            accept: [
                ["re dake level up na ke", "Baha", "gj\\.y"],
                ["re dake level up na ke", "LoliHouse"],
            ],
            // accept: "re dake level up na ke",
            // reject: [["sp(?!a)|ova|oad|special|特別"]],
        },
        // 憧憬成为魔法少女: {
        //     option: {
        //         dir: "/downloads/连载/憧憬成为魔法少女",
        //         uri: "https://mikanani.me/RSS/Classic",
        //     },
        //     accept: [
        //         ["Mahou Shoujo ni Akogarete", "Baha", "gj\\.y"],
        //         ["Mahou Shoujo ni Akogarete", "LoliHouse"],
        //     ],
        //     reject: [["sp(?!a)|ova|oad|special|特別"]],
        // },
        // 魔都精兵的奴隶: {
        //     option: {
        //         dir: "/downloads/连载/魔都精兵的奴隶",
        //     },
        //     accept: [
        //         ["Mato Seihei no Slave", "Baha", "gj\\.y"],
        //         ["Mato Seihei no Slave", "LoliHouse"],
        //     ],
        //     reject: [["sp(?!a)ova|oad|special|特別"]],
        // },
        // 药师少女的独语: {
        //     option: {
        //         dir: "/downloads/连载/药师少女的独语",
        //     },
        //     accept: [
        //         ["药师少女", "Baha", "gj\\.y"],
        //         ["药师少女", "LoliHouse"],
        //     ],
        //     reject: [["sp(?!a)ova|oad|special|特別"]],
        // },
        // 不死不幸: {
        //     option: {
        //         dir: "/downloads/连载/不死不幸",
        //     },
        //     accept: [
        //         ["ndead Unluc", "Baha", "gj\\.y"],
        //         ["ndead Unluc", "LoliHouse"],
        //     ],
        //     reject: [["sp(?!a)ova|oad|special|特別"]],
        // },
        // "香格里拉边境~粪作猎人向神作游戏发起挑战~": {
        //     option: {
        //         dir: "/downloads/连载/香格里拉边境~粪作猎人向神作游戏发起挑战~",
        //     },
        //     // accept: [
        //     //     ["lolihouse"],
        //     //     ["Shangri", "Baha", "gj\\.y"],
        //     //     ["Shangri", "LoliHouse"],
        //     // ],
        //     accept: "Shangri",
        //     reject: [["sp(?!a)ova|oad|special|特別"]],
        // },
        // "新番 全搬运 未分类": {
        //     option: {
        //         dir: "/downloads/连载/新番 全搬运 未分类",
        //     },
        //     accept: [["lolihouse"], ["gj.y", "baha"], ["ani", "bilibili"]],
        //     reject: [["bdrip|合集"]],
        // },
    },
};
