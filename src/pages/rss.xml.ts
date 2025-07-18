import { getCollection } from "astro:content";
import { SITE } from "../consts";
import type { APIContext } from "astro";

// Simple markdown to HTML converter for basic formatting
function markdownToHtml(markdown: string): string {
  return (
    markdown
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Convert *italic* to <em>
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Convert _italic_ to <em>
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Convert [link text](url) to <a href="url">link text</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Convert line breaks to <br>
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      // Wrap in paragraphs
      .replace(/^(.+)$/s, "<p>$1</p>")
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, "")
      .replace(/<p><br><\/p>/g, "")
  );
}

export async function GET(context: APIContext) {
  const stories = await getCollection("stories", ({ data }) => !data.draft);

  const items = stories.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );

  // Convert markdown content to HTML for RSS
  const itemsWithContent = items.map((item) => {
    const contentHtml = markdownToHtml(item.body);
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
