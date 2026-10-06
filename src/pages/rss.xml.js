import rss from '@astrojs/rss';
import { SITE } from '../site.config';
import { getPublishedPosts } from '../lib/content';

export async function GET(context) {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/posts/${post.id}`,
      categories: [post.data.category, ...post.data.tags],
      author: SITE.author,
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
}
