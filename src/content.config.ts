import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 内容模型 —— 与 docs/需求方案.md §4 一一对应。
 * 这里定义的 schema 会在构建时校验：frontmatter 写错字段直接报错，
 * 不会静默渲染成 undefined。
 */

/** 文章。文件放 src/content/posts/ 下，可以按年份或主题建子文件夹。 */
const posts = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/posts',
    /**
     * 同时支持两种组织方式：
     *   posts/foo.md            扁平式
     *   posts/foo/index.md      目录式（文章自带本地图片时用这种）
     * 两者都映射到同一个 URL：/posts/foo。子文件夹不参与 URL。
     * 注意：同名会冲突，这是有意的约束——一篇文章只有一个 URL。
     */
    generateId: ({ entry }) => {
      const segments = entry.replace(/\.mdx?$/, '').split('/');
      const last = segments[segments.length - 1];
      return last === 'index' ? (segments[segments.length - 2] ?? 'index') : last;
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60, { error: '标题不要超过 60 字，会影响 SEO 与列表排版' }),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      /** 分类：单值、稳定。与「标签」的分工见需求方案 §4.1 */
      category: z.string(),
      /** 标签：多值、灵活 */
      tags: z.array(z.string()).default([]),
      /** 封面图：放文章同目录。不填则列表卡片自动收拢成纯文字 */
      cover: image().optional(),
      /**
       * 封面比例。auto（默认）会按图片真实尺寸自动归到最接近的标准比例，
       * 直接丢图进来就行，不用手填。矩形标准取 16:9 —— 它是文章封面的
       * 业界事实标准，也能无损裁进 Open Graph / 社交卡片。
       */
      coverAspect: z.enum(['auto', '16:9', '3:2', '4:3', '1:1']).default('auto'),
      /** true 则不参与构建、不进列表、不进 RSS */
      draft: z.boolean().default(false),
      /** 关联专辑 id（双向导流）。需与 src/content/albums/ 下的目录名一致 */
      album: z.string().optional(),
      toc: z.boolean().default(true),
      /** 置 true 才在该页加载 KaTeX 样式，避免全站为偶尔的公式付性能代价 */
      math: z.boolean().default(false),
    }),
});

/**
 * 专辑。每张专辑一个目录：
 *   src/content/albums/<id>/index.md
 *   src/content/albums/<id>/cover.png
 * 目录名即 id，也就是 /albums/<id> 的 URL。
 */
const albums = defineCollection({
  loader: glob({
    pattern: '**/index.{md,mdx}',
    base: './src/content/albums',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      artist: z.string(),
      year: z.number().int(),
      /**
       * 发行形态：**单值**（与文章那边「分类单值、标签多值」同一原则）。
       *
       * 这五类是**混合维度**的（LP/EP 看曲目规模，Live 看录制方式，精选看曲目来源），
       * 所以理论上会有交叉（如「演唱会精选」）。真要补充说明写进正文，不要扩成多值。
       *
       * ⚠ 「单曲」指**单曲碟**（CDS，一张碟 2–4 首），与三期规划的独立「单曲」集合
       *   是两回事 —— 后者是「从专辑里拎出来单独评的一首歌」，各有各的页面。
       *
       * **LP 是常态**：数据里照填（否则筛选栏不会有 LP），但卡片上**不显示标记** ——
       * 标了它，标记就成了背景噪音，反而看不出「这张不普通」。
       */
      type: z.enum(['LP', 'EP', 'Live', '精选', '单曲']).optional(),
      /**
       * 演唱语种。**单值**，驱动专辑墙的「语种」筛选。
       *
       * 为什么不按「港 / 台 / 内地」分地区：地区是**歌手身份的归属**，不是音乐本身的属性 ——
       * 歌手常有多重身份（北京出生、香港出道），归属判断会一直扯不清；而「歌用什么语言唱」
       * 是事实，且直接影响听感。见需求方案 §4.2。
       *
       * **只做筛选，不在卡片上显示** —— 语种回答的是「它属于哪一类」，
       * 不是「这张特别在哪」，与 `type` 的标记分工不同。
       */
      language: z.string().optional(),
      /** 封面图：放专辑同目录，走 Astro 图片优化管线（自动 WebP/AVIF + 响应式） */
      cover: image(),
      /** 0–10，允许一位小数 */
      rating: z.number().min(0).max(10).optional(),
      genre: z.array(z.string()).default([]),
      /** 心情/场景，驱动专辑墙的前端筛选 */
      mood: z.array(z.string()).default([]),
      listenedAt: z.coerce.date().optional(),
      /** 是否进入「年度十佳」候选 */
      pick: z.boolean().default(false),
      /** 外部链接，比如网易云音乐专辑页 */
      link: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

/**
 * 歌手档案。每份一个目录：
 *   src/content/artists/<id>/index.md
 *   src/content/artists/<id>/avatar.png   （可选）
 * 目录名即 id，也就是 /artists/<id> 的 URL。
 *
 * ⚠ 关键设计：聚合专辑靠 frontmatter 的 `name` 去匹配专辑的 `artist`（字符串精确相等），
 * **不是**靠目录名 —— 否则现有 11 张专辑的 artist 全得改写成 URL 用的 id。
 * 代价是「陈慧娴 / 陈慧嫻」这类错别字会**静默失配**，所以 lib/content.ts 里有构建时校验兜底。
 *
 * 档案是**可选**的：没写档案的歌手也会由专辑自动汇总出页面，只是卡片朴素一些（无头像、无评分）。
 */
const artists = defineCollection({
  loader: glob({
    pattern: '**/index.{md,mdx}',
    base: './src/content/artists',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      /** 显示名。必须与专辑 frontmatter 的 artist 完全一致，否则聚合不上 */
      name: z.string(),
      /** 头像，可选。不填则歌手墙显示占位块 */
      avatar: image().optional(),
      /** 0–10，我的评分（与专辑同一把尺子） */
      rating: z.number().min(0).max(10).optional(),
      /** 外部主页，比如网易云歌手页 */
      link: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts, albums, artists };
