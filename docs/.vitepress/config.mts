import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Pomelo",
    description: "基于 Bunjs 和 Aria2 的资源下载工具,配置灵活,支持多种资源。",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        siteTitle: "Pomelo",
        nav: [
            { text: "指南", link: "/guide.md" },
            { text: "API", link: "/API.md" },
        ],

        // sidebar: [
        //   {
        //     text: 'Examples',
        //     items: [
        //       { text: 'Markdown Examples', link: '/markdown-examples' },
        //       { text: 'Runtime API Examples', link: '/api-examples' }
        //     ]
        //   }
        // ],

        socialLinks: [
            { icon: "github", link: "https://github.com/Azzellz/pomelo" },
        ],
    },
});
