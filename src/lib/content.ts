import { getCollection, type CollectionEntry } from 'astro:content';

import listeningStatsData from '../data/listening-stats.json';
import nowPlayingData from '../data/now-playing.json';

export type Post = CollectionEntry<'posts'>;
export type Album = CollectionEntry<'albums'>;

/**
 * 内容校验提示：**同一条消息只出现一次**。
 *
 * 为什么需要它：`collectArtists()` 这类聚合函数是**按页面**调用的 —— 十几张专辑
 * 就调十几次，于是同一句「这些歌手还没有档案」会在构建日志里刷十几遍，
 * 真正的问题反而被淹掉。内容校验是**构建级**的信息，说一次就够。
 *
 * 按消息文本去重（消息里已含具体的 id / 名字），所以不同问题仍然各自可见。
 */
const warnedMessages = new Set<string>();
function warnOnce(message: string): void {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(message);
}

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

/**
 * 专辑的曲目表，**归一成「分节」数组**，每节形如 `{ disc?, items }`。
 *
 * 为什么是分节而不是拍平：
 *   - 单碟专辑 → 只有一节、`disc` 为空 → 页面就渲染成一路编号到底（与以前一样）
 *   - 多碟专辑 → 每碟一节、`disc` 是碟名 → 页面在节间画分隔线，**编号按碟重新起算**
 *     （唱片上本来就是这么编的，拍平会丢掉这个信息）
 *
 * frontmatter 里三种写法都接受（纯字符串 / 带 note 的对象 / `{disc, tracks}` 分组，可混用，
 * 见 content.config.ts），所有消费方都走这里，别直接读 `album.data.tracks`。
 */
export type TrackSection = {
  /** 碟名（如 "CD 1"）。单碟专辑没有这一项 */
  disc?: string;
  items: { title: string; note?: string }[];
};

export function tracksOf(album: Album): TrackSection[] {
  const normalize = (item: string | { title: string; note?: string }) =>
    typeof item === 'string' ? { title: item } : item;

  const sections: TrackSection[] = [];
  for (const entry of album.data.tracks) {
    if (typeof entry === 'object' && 'disc' in entry) {
      sections.push({ disc: entry.disc, items: entry.tracks.map(normalize) });
    } else {
      // 没写 disc 的曲目归到「无碟名」那一节；与写在前面的分组互不干扰
      const last = sections[sections.length - 1];
      if (last && last.disc === undefined) last.items.push(normalize(entry));
      else sections.push({ items: [normalize(entry)] });
    }
  }
  return sections;
}

/**
 * 这张专辑里，**每首歌各自的那篇乐评**（曲目标题 → 文章）。
 *
 * 关联写在**文章**上（`album` + `track`），专辑页反查 —— 与「文章 → 专辑」同一套。
 * 好处是：新写一篇乐评只要在文章里声明，**不必回头改专辑文件**。
 *
 * 标题按 trim 后精确比较（同歌手档案的做法：错别字应当被喊出来，而不是悄悄容忍）。
 * 对不上的会 warn，页面照常渲染（那首歌只是没有入口）。
 */
export async function getTrackReviews(album: Album): Promise<Map<string, Post>> {
  const posts = await getPublishedPosts();
  const titles = new Set(
    tracksOf(album).flatMap((section) => section.items.map((track) => track.title.trim()))
  );

  const map = new Map<string, Post>();
  for (const post of posts) {
    if (!albumIdsOf(post).includes(album.id)) continue;

    const track = post.data.track?.trim();
    if (!track) continue;

    if (!titles.has(track)) {
      warnOnce(
        `[albums] 专辑「${album.id}」的曲目表里没有「${track}」，` +
          `但文章「${post.id}」的 track 声明写的是它 —— 检查是否写错字。`
      );
      continue;
    }

    if (map.has(track)) {
      warnOnce(`[albums] 专辑「${album.id}」的「${track}」有多篇乐评，只取较新的那篇。`);
      continue;
    }
    map.set(track, post);
  }
  return map;
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
 * 构建时算出来，零运行时成本（需求方案 §7 一期第 12 项）。
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

/**
 * 相邻文章：按传入顺序（发布时间倒序）取前后各一篇。
 *
 * 返回值语义（时间轴视角，不是数组下标视角）：
 *   prev = 时间上**更早**的一篇（数组中排在后面）
 *   next = 时间上**更新**的一篇（数组中排在前面）
 *
 * 首篇的 next 为 undefined、末篇的 prev 为 undefined，调用方需自行兜底。
 * 与 relatedPosts 一样在构建时算好，零运行时成本。
 */
export function adjacentPosts(current: Post, all: Post[]): { prev?: Post; next?: Post } {
  const index = all.findIndex((p) => p.id === current.id);
  if (index === -1) return {};
  return { next: all[index - 1], prev: all[index + 1] };
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

/* ---------------------------------------------------------------------------
 * 歌手与音乐数据（三期）
 *
 * 歌手不是第三份要逐个手写的清单：绝大多数歌手由专辑的 `artist` 自动汇总产生，
 * 档案只用来给喜欢的歌手补头像 / 评分 / 简介。
 * ------------------------------------------------------------------------- */

export type Artist = CollectionEntry<'artists'>;

/** 所有对外可见的歌手档案（= 手写过档案的那部分，多数歌手没有） */
export async function getPublishedArtists(): Promise<Artist[]> {
  const artists = await getCollection('artists', ({ data }) => !data.draft);
  return artists.sort((a, b) => a.data.name.localeCompare(b.data.name, 'zh'));
}

/** 一位歌手（可能没有档案）+ 他的作品。歌手墙与 /music 花园的数据来源。 */
export type ArtistEntry = {
  /** URL 段。有档案时用档案目录名（ASCII），否则退回显示名（浏览器会百分号编码，能用） */
  id: string;
  name: string;
  /** 有档案才有 */
  profile?: Artist;
  albums: Album[];
  rating?: number;
};

/**
 * 把专辑按 `artist` 聚合成歌手列表（需求方案 §7.4）。
 *
 * 匹配规则：档案的 `name` === 专辑的 `artist`（trim 后精确相等）。
 * **刻意不做模糊匹配** —— 错别字应当被校验喊出来，而不是悄悄容忍成另一位歌手。
 *
 * 两条校验，都只 warn、不中断构建：
 *   - 有档案却匹配不到任何作品 → 大概率是错别字或写法不一致（§7.9 的兜底）
 *   - 同一显示名有两份档案     → 后者被忽略
 * 「有作品、没档案」是**合法状态**，不报。
 */
export async function collectArtists(): Promise<ArtistEntry[]> {
  const [albums, profiles] = await Promise.all([getPublishedAlbums(), getPublishedArtists()]);

  const profileByName = new Map<string, Artist>();
  for (const profile of profiles) {
    const key = profile.data.name.trim();
    const existing = profileByName.get(key);
    if (existing) {
      warnOnce(
        `[artists] 显示名「${key}」有两份档案：${existing.id} 与 ${profile.id}，只采用前者。`
      );
      continue;
    }
    profileByName.set(key, profile);
  }

  const albumsByArtist = new Map<string, Album[]>();
  for (const album of albums) {
    const key = album.data.artist.trim();
    const list = albumsByArtist.get(key);
    if (list) list.push(album);
    else albumsByArtist.set(key, [album]);
  }

  for (const profile of profiles) {
    const key = profile.data.name.trim();
    if (!albumsByArtist.has(key)) {
      warnOnce(
        `[artists] 档案「${key}」（${profile.id}）匹配不到任何专辑的 artist —— ` +
          `检查是否写错字，或这位歌手的专辑尚未入库。`
      );
    }
  }

  // 反方向：有作品、没档案。这是**合法状态**（页面照常生成），
  // 但 URL 会退回中文名（一长串 %E6%B0%B8…），所以提示一句。
  const profiledNames = new Set(profileByName.keys());
  const missing = [...albumsByArtist.keys()].filter((name) => !profiledNames.has(name));
  if (missing.length > 0) {
    warnOnce(
      `[artists] 这些歌手还没有档案：${missing.join('、')}。页面照常生成，` +
        `但 URL 会用中文名；想要干净的 ASCII 地址，在 src/content/artists/<id>/index.md 补一份档案即可。`
    );
  }

  const entries: ArtistEntry[] = [...albumsByArtist.entries()].map(([name, list]) => {
    const profile = profileByName.get(name);
    return { id: profile?.id ?? name, name, profile, albums: list, rating: profile?.data.rating };
  });

  // 有评分者按评分降序在前；无评分者按作品数降序，同数按名字
  return entries.sort((a, b) => {
    const ar = a.rating ?? -1;
    const br = b.rating ?? -1;
    if (ar !== br) return br - ar;
    if (a.albums.length !== b.albums.length) return b.albums.length - a.albums.length;
    return a.name.localeCompare(b.name, 'zh');
  });
}

/** 在聚合结果里按 URL 段取一位歌手 */
export async function getArtistEntry(id: string): Promise<ArtistEntry | undefined> {
  const entries = await collectArtists();
  return entries.find((entry) => entry.id === id);
}

/**
 * 把文章的 `album` 字段统一成 id 数组。
 *
 * frontmatter 两种写法都接受：单张写字符串、多张写数组（见 content.config.ts）。
 * 所有消费方都应当走这里，不要直接读 `post.data.album` —— 否则会在
 * 「字符串」与「数组」两种形态之间反复分叉。
 */
export function albumIdsOf(post: Post): string[] {
  const value = post.data.album;
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * 文章关联的专辑，**按 frontmatter 里写的顺序**返回（写数组时顺序即展示顺序）。
 *
 * 与专辑页的反查（`albumIdsOf(post).includes(album.id)`）配成双向：
 * 那边由专辑找文章，这边由文章找专辑，两头都通，导流才闭合。
 *
 * 只会返回**真实存在**的专辑；某个 id 对不上时只 warn、不中断构建，
 * 页面照常渲染（只是少一个出口）。刻意不做容错匹配 ——
 * 写错字应当被喊出来，而不是悄悄失联。
 */
export async function getPostAlbums(post: Post): Promise<Album[]> {
  const ids = albumIdsOf(post);
  if (ids.length === 0) return [];

  const albums = await getPublishedAlbums();
  const byId = new Map(albums.map((album) => [album.id, album]));

  const found: Album[] = [];
  for (const id of ids) {
    const album = byId.get(id);
    if (album) {
      found.push(album);
    } else {
      warnOnce(
        `[posts] 文章「${post.id}」的 album 字段指向「${id}」，但找不到这张专辑 —— ` +
          `检查 id 是否写错（应为 src/content/albums/ 下的目录名）。`
      );
    }
  }
  return found;
}

/**
 * 「正在听」——**手写快照**，不是「此刻正在播放」。
 * `album` 字段是专辑 id，只用来取封面；对不上就只显示文字，不报错。
 */
export async function getNowPlaying() {
  const albums = await getPublishedAlbums();
  const album = nowPlayingData.album
    ? albums.find((item) => item.id === nowPlayingData.album)
    : undefined;

  return {
    title: nowPlayingData.title,
    artist: nowPlayingData.artist,
    note: nowPlayingData.note as string | undefined,
    album,
  };
}

/**
 * 网易云累计收听榜（需求方案 §7.6）。
 *
 * **外部数据的如实展示**，不接任何 API —— 数字由本人提供截图、人工录入。
 * 因此展示时**必须**带 `source` 与 `scope` 落款：网易云只统计它自己 App 内的播放，
 * 不标注就等于把「网易云播放次数」说成「总收听量」。
 */
export function getListeningStats() {
  return listeningStatsData;
}
