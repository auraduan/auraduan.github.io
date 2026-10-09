import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { SITE } from './src/site.config';
import remarkCodeLanguage from './src/lib/remark-code-language';
import remarkCjkSpacing from './src/lib/remark-cjk-spacing';

export default defineConfig({
  site: SITE.url,

  // 内页链接在鼠标悬停时预取目标页面，点击时「秒开」。
  // 纯静态站没有服务端成本，预取只是提前把 HTML 下载好。
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  // Tailwind 4 走 Vite 插件，配置写在 src/styles/global.css 的 @theme 里。
  // 注意：Tailwind 4 已经没有 tailwind.config.js，别照旧教程抄。
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    // 代码高亮：行号、复制按钮、diff 标记
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      useDarkModeMediaQuery: false,
      // 由 <html class="dark"> 驱动明暗，与全站主题切换保持一致
      themeCssSelector: (theme) => `.${theme.type}`,
    }),
    sitemap(),
  ],

  markdown: {
    // LaTeX 公式：remark-math 解析 $...$ / $$...$$，rehype-katex 渲染为 HTML
    // remarkCodeLanguage 给每个代码块补 title=语言名，让标题栏显示语言类型
    // remarkCjkSpacing 在汉字与拉丁字母/数字之间插入细空格（中文排版惯例）
    remarkPlugins: [remarkMath, remarkCodeLanguage, remarkCjkSpacing],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      wrap: true,
    },
  },
});
