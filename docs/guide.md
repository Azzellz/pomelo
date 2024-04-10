# pomelo(柚子)

[文档](https://pomelo.pages.dev/)

基于 Bun/Nodejs 和 Aria2 的资源解析工具,配置灵活,支持多种资源。

# 支持的资源

pomelo 内置了一些常用的资源解析,也支持自定义资源解析

## RSS

1. [mikanami](https://mikanani.me/)
2. [share.acgnx](https://share.acgnx.se/)
3. [nyaa](https://nyaa.si/)

## 自定义资源

需要使用 pomelo.config.ts/js 自行实现 parser

demo:

```ts
...
resource: {
    url: "https://mikanani.me/RSS/Classic",
    type: "rss-mikanani",
    async parser(
        target: any,
        handler: (content: string, link: string) => void
    ) {
        for (const ch of any.rss.channel) {
            for (const item of ch.item) {
                await handler(item.title[0], item.enclosure[0].$.url);
            }
        }
    },
}
...
```

tip: 当同时存在内置支持的type和parser时,pomelo将优先使用parser进行解析

# 快速开始

1. 直接使用 release 的二进制文件
2. 使用pomelo提供的api

# 配置文件

pomelo 支持 5 种配置文件格式:

加载优先级自上而下递减

1. pomelo.config.ts
2. pomelo.config.js
3. pomelo.json
4. pomelo.yaml
5. pomelo.yml

## pomelo.config.ts/js(推荐)

最推荐的配置文件,非常灵活,可以自行实现 parser,适合有 ts/js 经验的使用者。

样例:

```typescript
export default {
    interval: 0, //定时任务间隔,为0或者不写则以一次性任务进行,单位为秒
    //资源配置项
    resource: {
        url: "https://mikanani.me/RSS/Classic",
        type: "rss-mikanani",
        async parser(
            target: obejct,
            handler: (content: string, link: string) => void
        ) {
            for (const ch of target.rss.channel) {
                for (const item of ch.item) {
                    await handler(item.title[0], item.enclosure[0].$.url);
                }
            }
        },
    },
    aria2: {
        //aria2配置,支持环境变量
        env: true,
        // host: "$POMELO_ARIA2_HOST",
        // port: "$POMELO_ARIA2_PORT",
        // token: "$POMELO_ARIA2_TOKEN",
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

# 命令行参数

使用二进制文件时,pomelo 也支持命令行参数

1. -d / --dir: 指定根目录

```bash
./pomelo -d . //指定当前目录
./pomelo //默认指定当前目录
./pomelo --dir ..    //指定上一级目录
./pomelo --dir ../    //指定上一级目录
```

2. -r / --record: 只更新\_\_record.json,不发送下载请求

```bash
./pomelo -r
./pomelo --record
```
