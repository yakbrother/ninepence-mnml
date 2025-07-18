import { getCollection } from "astro:content";
import { SITE } from "../consts";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const stories = await getCollection("stories", ({ data }) => !data.draft);

  const items = stories.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE.TITLE}</title>
    <description>${SITE.DESCRIPTION}</description>
    <link>${SITE.WEBSITE_URL}</link>
    <language>en</language>
    ${items
      .map(
        (item) => `
    <item>
      <title>${item.data.title}</title>
      <description>${item.data.description}</description>
      <link>${SITE.WEBSITE_URL}/stories/${item.slug}/</link>
      <pubDate>${new Date(item.data.date).toUTCString()}</pubDate>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    },
  );
}
