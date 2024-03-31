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

## pomelo.config.ts(推荐)

最推荐的配置文件,灵活,适合有 ts 经验的使用者

样例:

```typescript
export default {
    interval: 0, //定时任务间隔,为0或者不写则以一次性任务进行
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
                dir: "/downloads/连载/{{rule.name}}", //下载路径,可以使用{{rule.name}}作为规则名占位符
            },
            accept: [
                //接受匹配的条件: 二维数组中的每个数组之间以或模式进行运算,每个数组内的每个关键词以与模式进行运算
                ["Frieren", "Baha", "gj\\.y"],
                ["Frieren", "LoliHouse"],
            ],
            reject: [["sp|ova|oad|special|特別"]], //拒绝匹配的条件
        },
    },
};
```
