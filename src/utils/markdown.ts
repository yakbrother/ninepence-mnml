/*
 * Minimal, server-safe markdown rendering for story content stored in Sanity.
 *
 * Safety comes from escaping first: every character of the author's text is
 * HTML-escaped before any markup is added, so the only tags in the output are
 * the handful this module generates, and link targets are limited to
 * http(s), mailto and site-relative URLs. This needs no DOM, which matters
 * because these pages render on the server (DOMPurify has no `sanitize`
 * without a window, so the previous version threw on every render).
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export interface Video {
  platform: string;
  id: string;
  title: string;
  description: string;
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);
}

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => XML_ENTITIES[c]);
}

/**
 * Returns the URL if it is safe to use as a link target, otherwise null.
 * Anything with a scheme must be http, https or mailto; scheme-less URLs are
 * treated as relative. Whitespace and control characters are ignored when
 * reading the scheme, as browsers do ("java\tscript:" is still javascript:).
 */
export function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (trimmed === '') {
    return null;
  }

  const compact = trimmed.replace(/[\u0000- \u007f]/g, '');
  const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/i);
  if (!scheme) {
    return trimmed;
  }

  return ['http', 'https', 'mailto'].includes(scheme[1].toLowerCase()) ? trimmed : null;
}

function getAttribute(attributes: string, name: string): string | null {
  const match = attributes.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'));
  return match ? match[1] : null;
}

// Embedded players can't be carried through safely, so each iframe becomes a
// plain link to its source (named by its title), matching the RSS behaviour.
function iframesToLinks(markdown: string): string {
  return markdown.replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi, (_match, attributes: string) => {
    const src = getAttribute(attributes, 'src');
    if (!src) {
      return '';
    }

    const title = (getAttribute(attributes, 'title') || 'watch video').replace(/[[\]]/g, '');
    return `[${title}](${src.replace(/\)/g, '%29')})`;
  });
}

function renderInline(escaped: string): string {
  const links: string[] = [];

  // Links first, parked behind placeholders so their URLs aren't touched by
  // the emphasis rules below (e.g. underscores in an Instagram handle).
  const withPlaceholders = escaped.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, text: string, url: string) => {
    const href = safeUrl(decodeEntities(url));
    const html = href === null ? text : `<a href="${escapeHtml(href)}">${text}</a>`;
    links.push(html);
    return `\u0000${links.length - 1}\u0000`;
  });

  return withPlaceholders
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/\u0000(\d+)\u0000/g, (_match, index: string) => links[Number(index)]);
}

function decodeEntities(escaped: string): string {
  return escaped
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function renderBlock(block: string): string {
  const heading = block.match(/^(#{1,3}) (.+)$/);
  if (heading) {
    const level = heading[1].length;
    return `<h${level}>${renderInline(heading[2])}</h${level}>`;
  }

  return `<p>${renderInline(block).replace(/\n/g, '<br>')}</p>`;
}

/**
 * Converts story markdown (paragraphs, line breaks, #-### headings, bold,
 * italic, links) to HTML that is safe to render with set:html.
 */
export function markdownToHtml(markdown: string | null | undefined): string {
  if (!markdown) {
    return '';
  }

  const escaped = escapeHtml(iframesToLinks(markdown.replace(/\r\n?/g, '\n')));

  return escaped
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block !== '')
    .map(renderBlock)
    .join('');
}

/**
 * HTML for an RSS <description><![CDATA[ ... ]]>. CDATA content is not
 * entity-decoded by feed readers, so it must be raw HTML (escaping it again
 * made readers show literal tags); only a literal "]]>" needs splitting.
 */
export function markdownToHtmlForRss(markdown: string | null | undefined): string {
  return cdataSafe(markdownToHtml(markdown));
}

export function cdataSafe(html: string): string {
  return html.replace(/]]>/g, ']]]]><![CDATA[>');
}

/**
 * Escapes text for RSS title fields
 */
export function escapeRssTitle(title: string): string {
  return escapeXml(title);
}

/**
 * Serialises JSON-LD for an inline <script>. "<" is escaped so content can't
 * close the script element early.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * "Videos in this post" block appended to RSS items. Every CMS-provided value
 * is escaped; the platform must be a bare hostname label.
 */
export function generateVideoLinks(videos?: Video[] | null): string {
  if (!videos || videos.length === 0) {
    return '';
  }

  const videoLinks = videos
    .filter((video) => /^[a-z0-9-]+$/i.test(video.platform) && video.id)
    .map((video) => {
      const id = encodeURIComponent(video.id);
      const url =
        video.platform.toLowerCase() === 'youtube'
          ? `https://www.youtube.com/watch?v=${id}`
          : `https://${video.platform.toLowerCase()}.com/watch?v=${id}`;

      return `<p><strong>${escapeHtml(video.title)}</strong>: <a href="${url}">${escapeHtml(video.description)}</a></p>`;
    })
    .join('');

  if (videoLinks === '') {
    return '';
  }

  return `<div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #007acc;">
    <h3>Videos in this post:</h3>
    ${videoLinks}
  </div>`;
}
