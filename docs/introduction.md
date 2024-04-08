# Pomelo(柚子)

[文档](https://pomelo.pages.dev/)

基于 Bunjs 和 Aria2 的资源解析工具,配置灵活,支持多种资源。

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

