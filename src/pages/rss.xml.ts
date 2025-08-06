import { getCollection } from "astro:content";
import { SITE } from "../consts";
import type { APIContext } from "astro";

// Simple markdown to HTML converter for basic formatting
function markdownToHtml(markdown: string): string {
  return (
    markdown
      // Convert markdown headers to HTML headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Convert *italic* to <em>
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Convert _italic_ to <em>
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Convert [link text](url) to <a href="url">link text</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Convert iframe elements to clickable links
      .replace(
        /<iframe[^>]*src="([^"]*)"[^>]*title="([^"]*)"[^>]*>.*?<\/iframe>/g,
        '<a href="$1">$2</a>',
      )
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

// Generate video links HTML from videos metadata
function generateVideoLinks(
  videos?: Array<{
    platform: string;
    id: string;
    title: string;
    description: string;
  }>,
): string {
  if (!videos || videos.length === 0) return "";

  const videoLinks = videos
    .map((video) => {
      const url =
        video.platform === "youtube"
          ? `https://www.youtube.com/watch?v=${video.id}`
          : `https://${video.platform}.com/watch?v=${video.id}`;

      return `<p><strong>${video.title}</strong>: <a href="${url}">${video.description}</a></p>`;
    })
    .join("");

  return `<div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #007acc;">
    <h3>Videos in this post:</h3>
    ${videoLinks}
  </div>`;
}

export async function GET(context: APIContext) {
  const stories = await getCollection("stories", ({ data }) => !data.draft);

  const items = stories.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );

  // Convert markdown content to HTML for RSS and add video links
  const itemsWithContent = items.map((item) => {
    const contentHtml = markdownToHtml(item.body);
    const videoLinksHtml = generateVideoLinks(item.data.videos);
    const fullContent = contentHtml + videoLinksHtml;

    return {
      ...item,
      content: fullContent,
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
