# Pomelo (Yuzu)

[中文文档](./README.zh.md)

Pomelo is a resource download tool, based on Bunjs and Aria2. It is designed with a highly flexible configuration system and supports a variety of resource types.

# Supported Resources

Pomelo comes with built-in parsers for several commonly used resources, and also supports custom resource parsers.

## RSS

1. [mikanami](https://mikanani.me/)
2. [share.acgnx](https://share.acgnx.se/)
3. [nyaa](https://nyaa.si/)

## Custom Resources

To use custom resources, you'll need to implement your own parser using pomelo.config.ts/js.

Here's an example:

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

Please note that when a built-in type and a parser both exist, Pomelo will prioritize using the parser for parsing.

# Quick Start

1. Use the binary files provided directly in the release.
2. Use the API provided by Pomelo.

# Configuration File

Pomelo supports five configuration file formats:

The loading priority decreases from top to bottom.

1. pomelo.config.ts
2. pomelo.config.js
3. pomelo.json
4. pomelo.yaml
5. pomelo.yml

## pomelo.config.ts/js (Recommended)

This is the recommended configuration file format. It is very flexible as you can implement your own parser. It is especially suitable for users with experience in TypeScript or JavaScript.

Here's an example:

```typescript
export default {
    interval: 0, // Interval for timed tasks. If set to 0 or left blank, it will be treated as a one-time task. The unit is seconds.
    rss: {
        // RSS configuration
        uri: "https://mikanani.me/RSS/Classic", // Default RSS source. This source is used when the rule does not specify a source.
        save: "", // Save path for the XML downloaded each time. If this field is left blank or unwritten, it will not be saved.
    },
    aria2: {
        // Aria2 configuration
        host: "http://127.0.0.1",
        port: "6800",
        token: "",
    },
    rules: {
        // Rule sets
        "Farewell to Frieren": {
            option: {
                dir: "/downloads/Serials/{{rule.name}}", // Download path. You can use {{rule.name}} as a rule name placeholder.
            },
            accept: [
                // Accept matching conditions: Each array in the 2D array operates in an OR pattern, and each keyword within each array operates in an AND pattern.
                ["Frieren", "Baha", "gj\\.y"],
                ["Frieren", "LoliHouse"],
            ],
            reject: [["sp|ova|oad|special|特别"]], // Reject matching conditions.
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
        "Farewell to Frieren": {
            "option": {
                "dir": "/downloads/Serials/{{rule.name}}"
            },
            "accept": [
                ["Frieren", "Baha", "gj\\.y"],
                ["Frieren", "LoliHouse"]
            ],
            "reject": [["sp|ova|oad|special"]]
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
    Farewell to Frieren:
        option:
            dir: /downloads/Serials/{{rule.name}}
        accept:
            - - Frieren
              - Baha
              - gj\.y
            - - Frieren
              - LoliHouse
        reject:
            - - sp|ova|oad|special
```

# Command Line Parameters

Pomelo also supports command line parameters when using binary files.

1. -d / --dir: Specify the root directory.

```bash
./pomelo -d . //Specify the current directory.
./pomelo //Default to the current directory.
./pomelo --dir ..    //Specify the parent directory.
./pomelo --dir ../    //Specify the parent directory.
```

2. -r / --record: Only update the \_\_record.json file, do not send download requests.

```bash
./pomelo -r
./pomelo --record
```
