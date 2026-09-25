import { sanityClient } from "sanity:client";
import { SITE } from "../consts";
import type { APIContext } from "astro";
import {
  markdownToHtmlForRss,
  escapeRssTitle,
  generateVideoLinks,
  cdataSafe,
  type Video,
} from "../utils/markdown";

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
  videos?: Video[];
}

export async function GET(context: APIContext) {
  try {
    const stories = await sanityClient.fetch(
      `*[_type == "story" && !draft] | order(date desc)`,
    );

    // Convert markdown content to HTML for RSS and add video links
    const itemsWithContent = stories.map((story: Story) => {
      const contentHtml = markdownToHtmlForRss(story.content || "");
      const videoLinksHtml = generateVideoLinks(story.videos);
      return {
        ...story,
        content: contentHtml + cdataSafe(videoLinksHtml),
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
      <title>${escapeRssTitle(item.title)}</title>
      <description><![CDATA[${item.content}]]></description>
      <link>${SITE.WEBSITE_URL}/stories/${encodeURIComponent(item.slug.current)}/</link>
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
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
