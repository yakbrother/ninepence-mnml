import { sanityClient } from "sanity:client";
import { SITE } from "../consts";
import type { APIContext } from "astro";

// Define the story type based on the Sanity schema
interface Story {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  content: string;
  date: string;
  description?: string;
  draft?: boolean;
  tags?: string[];
}

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
  const stories = await sanityClient.fetch(
    `*[_type == "story" && !draft] | order(date desc)`,
  );

  // Convert markdown content to HTML for RSS
  const itemsWithContent = stories.map((story: Story) => {
    const contentHtml = markdownToHtml(story.content || "");
    return {
      ...story,
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
        (item: Story & { content: string }) => `
    <item>
      <title>${item.title.replace(/[<>&]/g, (match: string) => {
        const entities: Record<string, string> = {
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
        };
        return entities[match];
      })}</title>
      <description><![CDATA[${item.content}]]></description>
      <link>${SITE.WEBSITE_URL}/stories/${item.slug.current}/</link>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
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
