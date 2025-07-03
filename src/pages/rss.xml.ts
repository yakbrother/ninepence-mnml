import rss from "@astrojs/rss";
import { SITE } from "@consts";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

interface StoryData {
  draft?: boolean;
  date: Date;
  title: string;
  description: string;
}

interface Story {
  data: StoryData;
  collection: string;
  id: string;
}

export async function GET(context: APIContext) {
  const stories = (await getCollection("stories")).filter(
    (post) => !post.data.draft,
  ) as unknown as Story[];

  const items = stories.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site || SITE.WEBSITE_URL,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      pubDate: item.data.date,
      link: `/${item.collection}/${item.id}/`,
    })),
  });
}
