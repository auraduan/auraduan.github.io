import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { SITE } from './src/site.config';
import remarkCodeLanguage from './src/lib/remark-code-language';

export default defineConfig({
  site: SITE.url,

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
    remarkPlugins: [remarkMath, remarkCodeLanguage],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      wrap: true,
    },
  },
});
