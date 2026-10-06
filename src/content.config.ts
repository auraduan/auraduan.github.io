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

export const collections = { posts, albums };
