import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Pomelo",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        siteTitle: "Pomelo",
        nav: [
            { text: "指南", link: "/guide" },
            { text: "API", link: "/API" },
        ], search: {
            provider: 'local'
        },
        sidebar: [{
            text: 'Pomelo 简介', link: '/guide'
            
        },
        {
            text: '快速上手', link: '/guide'
            
        }, {
            text: '配置文件',
            collapsed: false,
            items: [
                { text: 'Task', link: '/guide' },
            ]
        }
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
