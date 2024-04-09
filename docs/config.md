# 配置文件

pomelo 支持 5 种配置文件格式:

加载优先级自上而下递减

1. pomelo.config.ts
2. pomelo.config.js
3. pomelo.json
4. pomelo.yaml
5. pomelo.yml

## yaml(推荐)
最推荐的配置文件,简单易用

样例:

```yaml
interval: 0
resource:
  url: https://share.acgnx.se/rss.xml
  type: "rss-share-acgnx"
record:
  expire: 604800
aria2:
  env: true  #代表启用读取环境变量的Aria2配置功能，可以不用编写下面的host,port,token，使用环境变量 POMELO_ARIA2_HOST POMELO_ARIA2_PORT POMELO_ARIA2_TOKEN 代替
  # host: http://127.0.0.1
  # port: 6800
  # token: example_token

rules:
  葬送的芙莉莲:
    option:
      dir: /downloads/连载/{{rule.name}}
    accept:
      - - Sousou no Frieren
        - baha
        - up to 21
      - - Sousou no Frieren
        - LoliHouse
    reject:
      - - sp|ova|oad|special|特別
  Final:
    option:
      dir: "/downloads/新番 全搬运 未分类"
    accept:
      - - up to 21
        - baha
      - - ani
        - bilibili
      - - LoliHouse
    reject:
      - - bdrip
        - 合集
```



## pomelo.config.ts/js

非常灵活,可以自行实现 parser,适合有 ts/js 经验的使用者。

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
