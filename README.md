# pomelo(柚子)

一个基于 nodejs 和 aria2 的自动化 rss 资源下载工具
支持多种的 RSS 源, 配置灵活

# 目前支持的 RSS 源

1. [mikanami](https://mikanani.me/)
2. [share.acgnx](https://share.acgnx.se/)
3. [nyaa](https://nyaa.si/)

# 配置文件

pomelo 支持 4 种配置文件:

优先级自上而下递减

1. pomelo.config.ts
2. pomelo.json
3. pomelo.yaml
4. pomelo.yml

## pomelo.config.ts

最推荐的配置文件,灵活,适合有 ts 经验的使用者

样例:

```typescript
export default {
    interval: 0, //定时任务间隔,为0则以一次性任务进行
    baseUrl: "../", //根路径
    rss: {
        //rss配置
        uri: "https://mikanani.me/RSS/Classic", //默认rss源,当rule没有指定源时使用该源
        save: "", //每次下载的xml的保存路径,置空或不写该字段则不保存
    },
    aria2: {
        //aria2配置
        host: "http://127.0.0.1",
        port: "6800",
        token: "",
    },
    rules: {
        //规则集
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
```
