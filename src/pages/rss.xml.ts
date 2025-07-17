import { getCollection } from "astro:content";
import { SITE } from "../consts";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const stories = await getCollection("stories", ({ data }) => !data.draft);

  const items = stories.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );

  // Convert markdown content to HTML for RSS
  const itemsWithContent = items.map((item) => {
    // Convert markdown to HTML for RSS feed
    const contentHtml = item.body;
    return {
      ...item,
      content: contentHtml,
    };
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE.TITLE}</title>
    <description>${SITE.DESCRIPTION}</description>
    <link>${SITE.WEBSITE_URL}</link>
    <language>en</language>
    ${itemsWithContent
      .map(
        (item) => `
    <item>
      <title>${item.data.title}</title>
      <description><![CDATA[${item.content}]]></description>
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
