# Linson's Blog

> 音乐、日常、代码与机器人。

一个**零后端、零数据库、零 CMS** 的个人内容站：正文用 Markdown 写，`git push` 即发布；视觉走 Apple 官网那种扁平极简。

**在线访问 → [https://auraduan.github.io](https://auraduan.github.io)**

[![Deploy](https://github.com/auraduan/auraduan.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/auraduan/auraduan.github.io/actions/workflows/deploy.yml)

---

## 内容板块

| 板块 | 说明 |
|---|---|
| **文章** | 按分类 / 标签组织，支持 Markdown、代码高亮、LaTeX 公式、阅读目录与相邻文章翻页 |
| **专辑墙** | 唱片封面网格，心情 / 场景筛选、评分与短评；点封面可以看黑胶转起来 |
| **工具导航** | 常用外部站点分组导航 |
| **关于** | 个人简介与主页入口 |

## 站点特性

**内容与阅读**

- 纯 Markdown 写作，`git push` 即发布
- LaTeX 公式（KaTeX），按文章开启，不默认加载
- 代码块自动标注语言，支持显式指定文件名标题
- 相关文章与相邻文章翻页均在**构建时**算好，零运行时成本

**检索与互动**

- 全站搜索（Pagefind 静态索引）+ `Ctrl / ⌘ + K` 命令面板
- 标签总览、分类归档、按年份的归档时间轴
- 随机文章「随便逛逛」

**视觉与体验**

- Apple 官网风的扁平极简：大留白、克制配色、全站唯一强调色
- 首屏全屏壁纸轮播 + Ken Burns 微动效（纯 CSS，零 JavaScript）
- 深浅色主题，切换无闪烁
- 完整响应式布局与竖屏触控优化

**工程**

- 零后端、零数据库、零 CMS、无第三方运行时服务
- 静态产物部署到 GitHub Pages，只保留**一条** CI 通道
- RSS 与 Sitemap 构建时生成
- 字体自托管（Inter + Noto Sans SC），不依赖访客的系统字体

## 技术栈

| 组件 | 版本 |
|---|---|
| [Astro](https://astro.build) | 7.3.5 |
| [Tailwind CSS](https://tailwindcss.com)（`@tailwindcss/vite`） | 4.3.3 |
| [Pagefind](https://pagefind.app) 全文搜索 | 1.5.2 |
| [KaTeX](https://katex.org) 数学公式 | 0.19.0 |
| Node.js | ≥ 22.12 |

## 本地开发

```bash
npm install
npm run dev        # 开发服务器 → http://localhost:4321
```

```bash
npm run build      # 构建 + 生成搜索索引
npm run preview    # 预览构建产物（不监听源码改动）
```

> `npm run build` 会在 `astro build` 之后自动跑 Pagefind 生成搜索索引。只执行 `astro build` 不带索引，站内搜索会降级。

## 部署

推送到 `main` 分支即由 GitHub Actions 自动构建并发布到 GitHub Pages，流程定义在 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。完整决策依据见 [`docs/需求方案.md`](docs/需求方案.md) 第 8 节。

## 项目结构

```
src/
├── content/            # Markdown 内容
│   ├── posts/          #   文章 · foo.md 或 foo/index.md → /posts/foo
│   └── albums/         #   专辑 · albums/<id>/index.md + 同目录封面
├── pages/              # 路由（文件即路由）
├── layouts/            # 页面布局
├── components/         # UI 组件（含搜索命令面板）
├── lib/                # 构建期工具（内容过滤、相关文章等）
├── styles/             # 全局样式与设计令牌
├── assets/             # 图片资源（壁纸、头像）
├── data/               # 独立内容（如「关于」页正文）
├── site.config.ts      # 全站唯一配置：站名 / 导航 / 工具链接 / 主页按钮
└── content.config.ts   # 内容集合 schema（Zod 严格校验）
docs/
├── 使用手册.md          # 日常操作速查：替换素材、写文章、发布、排障
└── 需求方案.md          # 设计决策与规范：页面清单、内容模型、视觉令牌、部署链路
```

## 声明

- **永久非商业用途** —— 无广告、无付费、无商业变现、无赞助。这是长期承诺，不是阶段性状态。
- **不提供评论功能**（任何形式），这是一个刻意的长期决定。
