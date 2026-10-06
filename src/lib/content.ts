import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Album = CollectionEntry<'albums'>;

/** 所有对外可见的文章，按发布时间倒序。草稿已被过滤。 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

/** 所有对外可见的专辑，按入坑时间倒序（无时间则按年份） */
export async function getPublishedAlbums(): Promise<Album[]> {
  const albums = await getCollection('albums', ({ data }) => !data.draft);
  return albums.sort((a, b) => {
    const at = a.data.listenedAt?.valueOf() ?? new Date(a.data.year, 0, 1).valueOf();
    const bt = b.data.listenedAt?.valueOf() ?? new Date(b.data.year, 0, 1).valueOf();
    return bt - at;
  });
}

/** 2026-10-06 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 2026 年 10 月 6 日 */
export function formatDateCN(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

/**
 * 阅读时长（分钟）。中文按 350 字/分钟，拉丁按 220 词/分钟。
 * 中英混排时两者相加，比单纯按字符数估算更接近实际。
 */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const cjk = (body.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = (body.match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 220));
}

/** 按出现频次倒序的标签列表 */
export function collectTags(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** 按出现频次倒序的分类列表 */
export function collectCategories(posts: Post[]): { category: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) {
    const c = post.data.category;
    map.set(c, (map.get(c) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

/** 按年份分组的归档：[['2026', Post[]], ...]，年份倒序 */
export function groupByYear(posts: Post[]): [string, Post[]][] {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    const y = String(post.data.publishedAt.getFullYear());
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(post);
  }
  return [...map.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
}

/**
 * 相关文章：按标签重叠数排序，重叠相同则取更新的。
 * 构建时算出来，零运行时成本（需求方案 §7 一期第 11 项）。
 */
export function relatedPosts(current: Post, all: Post[], limit = 3): Post[] {
  const tags = new Set(current.data.tags);
  return all
    .filter((p) => p.id !== current.id)
    .map((p) => ({
      post: p,
      score: p.data.tags.filter((t) => tags.has(t)).length + (p.data.category === current.data.category ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) =>
      b.score - a.score || b.post.data.publishedAt.valueOf() - a.post.data.publishedAt.valueOf()
    )
    .slice(0, limit)
    .map((x) => x.post);
}

/** 封面比例选项 */
export type CoverAspect = 'auto' | '16:9' | '3:2' | '4:3' | '1:1';

/**
 * 支持的标准封面比例。
 * 矩形以 16:9 为准：文章封面的业界事实标准，且能无损裁进社交卡片（OG / Twitter）。
 * 3:2 与 4:3 是相机直出的常见比例，一并收录。
 */
const ASPECT_RATIOS: Record<Exclude<CoverAspect, 'auto'>, number> = {
  '16:9': 16 / 9,
  '3:2': 3 / 2,
  '4:3': 4 / 3,
  '1:1': 1,
};

/** 把 frontmatter 的 coverAspect 解析成可直接写进 CSS 的 aspect-ratio 值。
 *
 * auto 时按图片真实尺寸归到最接近的标准比例。比较用的是**对数距离**而非差值——
 * 比例是尺度无关的量，直接比差值会偏向大比例（1.78/1.33 的差值远大于 1/1.33，
 * 会让接近 1:1 的图被误判）。
 */
export function resolveAspect(
  override: CoverAspect | undefined,
  image?: { width: number; height: number }
): string {
  if (override && override !== 'auto') return override.replace(':', ' / ');
  if (!image?.width || !image?.height) return '16 / 9';

  const actual = image.width / image.height;
  let best: keyof typeof ASPECT_RATIOS = '16:9';
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const key of Object.keys(ASPECT_RATIOS) as (keyof typeof ASPECT_RATIOS)[]) {
    const distance = Math.abs(Math.log(actual / ASPECT_RATIOS[key]));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = key;
    }
  }

  return best.replace(':', ' / ');
}
