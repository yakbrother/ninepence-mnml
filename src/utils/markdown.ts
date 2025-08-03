import { sanitize } from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
function sanitizeHtml(html: string): string {
  // Use DOMPurify to sanitize HTML content
  return sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Escapes XML special characters for RSS feeds
 */
function escapeXml(text: string): string {
  const entities: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  };
  
  return text.replace(/[<>&"']/g, (match) => entities[match]);
}

/**
 * Converts markdown to HTML with proper sanitization
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  const html = markdown
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
    .replace(/<p><br><\/p>/g, "");

  // Sanitize the HTML to prevent XSS
  return sanitizeHtml(html);
}

/**
 * Converts markdown to HTML for RSS feeds with XML escaping
 */
export function markdownToHtmlForRss(markdown: string): string {
  const html = markdownToHtml(markdown);
  
  // For RSS, we need to escape XML entities in the content
  return html.replace(/[<>&"']/g, (match) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[match];
  });
}

/**
 * Escapes text for RSS title fields
 */
export function escapeRssTitle(title: string): string {
  return escapeXml(title);
} 