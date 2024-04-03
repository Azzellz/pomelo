# pomelo(柚子)

基于Bunjs和Aria2的资源下载工具,配置灵活,支持多种资源。

# 目前支持的资源

pomelo内置了一些常用的资源解析,也支持自定义资源解析

## RSS
1. [mikanami](https://mikanani.me/)
2. [share.acgnx](https://share.acgnx.se/)
3. [nyaa](https://nyaa.si/)

## 自定义资源
需要使用pomelo.config.ts自行实现parser

# 快速开始

1. 直接使用 release 的二进制文件

# 配置文件

pomelo 支持 4 种配置文件:

优先级自上而下递减

1. pomelo.config.ts
2. pomelo.json
3. pomelo.yaml
4. pomelo.yml

## pomelo.config.ts(推荐)

最推荐的配置文件,灵活,适合有 ts 经验的使用者。

样例:

```typescript
export default {
    interval: 0, //定时任务间隔,为0或者不写则以一次性任务进行,单位为秒
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

## pomelo.json

```JSON
{
    "interval": 0,
    "rss": {
        "uri": "https://mikanani.me/RSS/Classic"
    },
    "aria2": {
        "host": "http://127.0.0.1",
        "port": "6800",
        "token": ""
    },
    "rules": {
        "葬送的芙莉莲": {
            "option": {
                "dir": "/downloads/连载/{{rule.name}}"
            },
            "accept": [
                ["Frieren", "Baha", "gj\\.y"],
                ["Frieren", "LoliHouse"]
            ],
            "reject": [["sp|ova|oad|special|特別"]]
        }
    }
}
```

## pomelo.yaml / pomelo.yml

```yaml
interval: 0
record:
    expire: 3600
rss:
    uri: https://mikanani.me/RSS/Classic
aria2:
    host: http://127.0.0.1
    port: "6800"
    token: ""
rules:
    葬送的芙莉莲:
        option:
            dir: /downloads/连载/{{rule.name}}
        accept:
            - - Frieren
              - Baha
              - gj\.y
            - - Frieren
              - LoliHouse
        reject:
            - - sp|ova|oad|special|特別
```

# 命令行参数

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
