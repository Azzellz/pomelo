import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Pomelo",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        siteTitle: "Pomelo",
        nav: [
            { text: "指南", link: "/introduction" },
            // { text: "API", link: "/API" },
        ], search: {
            provider: 'local'
        },
        sidebar: [{
            text: 'Pomelo 简介', link: '/introduction'
            
        },
        {
            text: '快速上手', link: '/startup'
            
        }, {
            text: '配置文件',link: '/config'
            
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
