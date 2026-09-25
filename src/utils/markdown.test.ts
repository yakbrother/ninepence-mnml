import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cdataSafe,
  escapeHtml,
  escapeRssTitle,
  generateVideoLinks,
  jsonLd,
  markdownToHtml,
  markdownToHtmlForRss,
  safeUrl,
} from './markdown.ts';

// --- markdownToHtml: structure -------------------------------------------

test('markdownToHtml: empty, null and undefined render nothing', () => {
  assert.equal(markdownToHtml(''), '');
  assert.equal(markdownToHtml(null), '');
  assert.equal(markdownToHtml(undefined), '');
});

// Regression: this used to throw "sanitize is not a function" on the server,
// which turned every story page into a 500 and blanked the homepage.
test('markdownToHtml: renders on the server without a DOM', () => {
  assert.equal(typeof (globalThis as { window?: unknown }).window, 'undefined');
  assert.doesNotThrow(() => markdownToHtml('hello'));
});

test('markdownToHtml: blank lines split paragraphs, single newlines become <br>', () => {
  assert.equal(
    markdownToHtml('first line\nsecond line\n\nnext paragraph'),
    '<p>first line<br>second line</p><p>next paragraph</p>',
  );
});

test('markdownToHtml: runs of blank lines and surrounding whitespace make no empty paragraphs', () => {
  assert.equal(markdownToHtml('\n\none\n\n\n\n  two  \n\n\n'), '<p>one</p><p>two</p>');
});

test('markdownToHtml: CRLF and CR line endings behave like LF', () => {
  assert.equal(markdownToHtml('a\r\nb\r\n\r\nc'), '<p>a<br>b</p><p>c</p>');
  assert.equal(markdownToHtml('a\rb\r\rc'), '<p>a<br>b</p><p>c</p>');
});

test('markdownToHtml: #, ## and ### blocks become headings', () => {
  assert.equal(markdownToHtml('# One'), '<h1>One</h1>');
  assert.equal(markdownToHtml('## Two'), '<h2>Two</h2>');
  assert.equal(markdownToHtml('### Three\n\nbody'), '<h3>Three</h3><p>body</p>');
});

test('markdownToHtml: #### and hashes without a space stay paragraph text', () => {
  assert.equal(markdownToHtml('#### Four'), '<p>#### Four</p>');
  assert.equal(markdownToHtml('#hashtag'), '<p>#hashtag</p>');
});

test('markdownToHtml: a heading line followed by text in the same block is not a heading', () => {
  assert.equal(markdownToHtml('## Title\nmore'), '<p>## Title<br>more</p>');
});

// --- markdownToHtml: inline --------------------------------------------------

test('markdownToHtml: bold and italic', () => {
  assert.equal(markdownToHtml('**bold** and *it* and _also_'), '<p><strong>bold</strong> and <em>it</em> and <em>also</em></p>');
});

test('markdownToHtml: emphasis inside a heading', () => {
  assert.equal(markdownToHtml('## a **b**'), '<h2>a <strong>b</strong></h2>');
});

test('markdownToHtml: underscores inside words and URLs are left alone', () => {
  assert.equal(markdownToHtml('snake_case_name'), '<p>snake_case_name</p>');
  assert.equal(
    markdownToHtml('[insta](https://instagram.com/sacre_sidebar_x)'),
    '<p><a href="https://instagram.com/sacre_sidebar_x">insta</a></p>',
  );
});

test('markdownToHtml: italic underscores at line start and after punctuation', () => {
  assert.equal(markdownToHtml('_start_ end'), '<p><em>start</em> end</p>');
  assert.equal(markdownToHtml('(_quiet_)'), '<p>(<em>quiet</em>)</p>');
});

test('markdownToHtml: links, including relative ones', () => {
  assert.equal(
    markdownToHtml('see [the story](/stories/x/) and [mail](mailto:a@example.com)'),
    '<p>see <a href="/stories/x/">the story</a> and <a href="mailto:a@example.com">mail</a></p>',
  );
});

test('markdownToHtml: several links in one paragraph keep their own targets', () => {
  assert.equal(
    markdownToHtml('[a](https://a.example) [b](https://b.example)'),
    '<p><a href="https://a.example">a</a> <a href="https://b.example">b</a></p>',
  );
});

test('markdownToHtml: ampersands in link URLs are escaped once, not twice', () => {
  assert.equal(
    markdownToHtml('[q](https://example.com/?a=1&b=2)'),
    '<p><a href="https://example.com/?a=1&amp;b=2">q</a></p>',
  );
});

// --- markdownToHtml: safety -------------------------------------------------

test('markdownToHtml: raw HTML from the CMS is escaped, not rendered', () => {
  assert.equal(
    markdownToHtml('<script>alert(1)</script><img src=x onerror=alert(1)>'),
    '<p>&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;</p>',
  );
});

test('markdownToHtml: quotes cannot break out of an href', () => {
  const html = markdownToHtml('[x](https://e.com/"onmouseover="alert(1))');
  assert.equal(html, '<p><a href="https://e.com/&quot;onmouseover=&quot;alert(1">x</a>)</p>');
});

for (const url of [
  'javascript:alert`1`',
  'JavaScript:void0',
  'data:text/html;base64,PHNjcmlwdD4=',
  'vbscript:msgbox',
]) {
  test(`markdownToHtml: unsafe link target ${JSON.stringify(url)} renders as plain text`, () => {
    assert.equal(markdownToHtml(`[click](${url})`), '<p>click</p>');
  });
}

// An entity-encoded colon stays literal text (the author's "&" is escaped),
// so the browser sees a harmless relative URL, never a javascript: scheme.
test('markdownToHtml: entity-encoded scheme colon stays inert', () => {
  assert.equal(
    markdownToHtml('[click](javascript&#58;void0)'),
    '<p><a href="javascript&amp;#58;void0">click</a></p>',
  );
});

// URLs containing whitespace or parens don't parse as links at all; whatever
// they turn into, no anchor may point at the script.
for (const url of ['java\tscript:alert(1)', ' javascript:alert(1)', 'javascript:alert(1)']) {
  test(`markdownToHtml: malformed unsafe link ${JSON.stringify(url)} produces no anchor`, () => {
    assert.ok(!markdownToHtml(`[click](${url})`).includes('<a'));
  });
}

test('markdownToHtml: iframes become links to their source, named by title', () => {
  assert.equal(
    markdownToHtml('<iframe width="5" src="https://www.youtube.com/embed/abc" title="My Song"></iframe>'),
    '<p><a href="https://www.youtube.com/embed/abc">My Song</a></p>',
  );
});

test('markdownToHtml: iframe attribute order does not matter and a missing title gets a default', () => {
  assert.equal(
    markdownToHtml('<iframe title="T" src="https://v.example/1"></iframe>'),
    '<p><a href="https://v.example/1">T</a></p>',
  );
  assert.equal(
    markdownToHtml('<iframe src="https://v.example/1"></iframe>'),
    '<p><a href="https://v.example/1">watch video</a></p>',
  );
});

test('markdownToHtml: an iframe without src is dropped; a javascript: src is not linked', () => {
  assert.equal(markdownToHtml('a <iframe title="x"></iframe> b'), '<p>a  b</p>');
  assert.equal(markdownToHtml('<iframe src="javascript:alert(1)" title="x"></iframe>'), '<p>x</p>');
});

test('markdownToHtml: brackets in iframe titles and parens in src do not break the link', () => {
  assert.equal(
    markdownToHtml('<iframe src="https://v.example/a(b)" title="[live] set"></iframe>'),
    '<p><a href="https://v.example/a(b%29">live set</a></p>',
  );
});

// --- safeUrl ----------------------------------------------------------------

test('safeUrl: allows http, https, mailto and relative URLs (trimmed)', () => {
  assert.equal(safeUrl('https://e.com'), 'https://e.com');
  assert.equal(safeUrl('HTTP://e.com'), 'HTTP://e.com');
  assert.equal(safeUrl('mailto:x@e.com'), 'mailto:x@e.com');
  assert.equal(safeUrl('  /stories/a/  '), '/stories/a/');
  assert.equal(safeUrl('#top'), '#top');
  assert.equal(safeUrl('page.html'), 'page.html');
});

test('safeUrl: rejects other schemes and empty input', () => {
  assert.equal(safeUrl('javascript:x'), null);
  assert.equal(safeUrl('ftp://e.com'), null);
  assert.equal(safeUrl('   '), null);
  assert.equal(safeUrl('\u0001javascript:x'), null);
  assert.equal(safeUrl('java\u007fscript:x'), null);
});

// --- escaping helpers -------------------------------------------------------

test('escapeHtml: escapes all five special characters', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('escapeRssTitle: XML-escapes titles', () => {
  assert.equal(escapeRssTitle(`Tom & "Jerry" <3 it's`), 'Tom &amp; &quot;Jerry&quot; &lt;3 it&apos;s');
});

// Regression: RSS content was XML-escaped *inside* CDATA, so feed readers
// showed literal "<p>" tags instead of formatted text.
test('markdownToHtmlForRss: returns raw HTML for CDATA, not entity-escaped HTML', () => {
  assert.equal(markdownToHtmlForRss('**hi**'), '<p><strong>hi</strong></p>');
  assert.equal(markdownToHtmlForRss(''), '');
});

test('cdataSafe / markdownToHtmlForRss: a literal ]]> cannot terminate the CDATA section', () => {
  assert.equal(cdataSafe('a]]>b]]>'), 'a]]]]><![CDATA[>b]]]]><![CDATA[>');
  // Via markdown the ">" is already escaped, so CDATA can't be closed.
  assert.equal(markdownToHtmlForRss('x ]]> y'), '<p>x ]]&gt; y</p>');
});

test('jsonLd: escapes < so content cannot close the script element', () => {
  const out = jsonLd({ headline: '</script><script>alert(1)</script>' });
  assert.ok(!out.includes('<'));
  assert.deepEqual(JSON.parse(out), { headline: '</script><script>alert(1)</script>' });
});

// --- generateVideoLinks -----------------------------------------------------

test('generateVideoLinks: nothing for missing or empty input', () => {
  assert.equal(generateVideoLinks(undefined), '');
  assert.equal(generateVideoLinks(null), '');
  assert.equal(generateVideoLinks([]), '');
});

test('generateVideoLinks: builds YouTube and other-platform watch URLs', () => {
  const html = generateVideoLinks([
    { platform: 'youtube', id: 'abc', title: 'Song', description: 'Live' },
    { platform: 'Vimeo', id: '42', title: 'Other', description: 'Take 2' },
  ]);
  assert.ok(html.includes('<h3>Videos in this post:</h3>'));
  assert.ok(html.includes('<p><strong>Song</strong>: <a href="https://www.youtube.com/watch?v=abc">Live</a></p>'));
  assert.ok(html.includes('<p><strong>Other</strong>: <a href="https://vimeo.com/watch?v=42">Take 2</a></p>'));
});

test('generateVideoLinks: escapes CMS values and encodes the id', () => {
  const html = generateVideoLinks([
    { platform: 'youtube', id: 'a"b&c', title: '<b>t</b>', description: '"d"' },
  ]);
  assert.ok(html.includes('href="https://www.youtube.com/watch?v=a%22b%26c"'));
  assert.ok(html.includes('<strong>&lt;b&gt;t&lt;/b&gt;</strong>'));
  assert.ok(html.includes('>&quot;d&quot;</a>'));
});

test('generateVideoLinks: skips entries with an unsafe platform or no id', () => {
  assert.equal(
    generateVideoLinks([
      { platform: 'evil.com/x?', id: '1', title: 't', description: 'd' },
      { platform: 'youtube', id: '', title: 't', description: 'd' },
    ]),
    '',
  );
});

// --- edge cases pinned by mutation testing ---------------------------------

test('escapeRssTitle: escapes > too', () => {
  assert.equal(escapeRssTitle('a > b'), 'a &gt; b');
});

test('safeUrl: a colon later in a relative URL is not a scheme', () => {
  assert.equal(safeUrl('/stories/a:b/'), '/stories/a:b/');
  assert.equal(safeUrl('page?next=javascript:x'), 'page?next=javascript:x');
});

test('markdownToHtml: iframe attributes are matched case-insensitively', () => {
  assert.equal(
    markdownToHtml('<IFRAME SRC="https://v.example/1" TITLE="T"></IFRAME>'),
    '<p><a href="https://v.example/1">T</a></p>',
  );
});

test('markdownToHtml: iframe fallback content (text and whitespace) is replaced along with the tag', () => {
  assert.equal(
    markdownToHtml('<iframe src="https://v.example/1" title="T">Your browser\ncannot play this</iframe>'),
    '<p><a href="https://v.example/1">T</a></p>',
  );
});

test('markdownToHtml: more than ten links in one paragraph all resolve', () => {
  const md = Array.from({ length: 12 }, (_v, i) => `[l${i}](/p/${i})`).join(' ');
  const html = markdownToHtml(md);
  for (let i = 0; i < 12; i++) {
    assert.ok(html.includes(`<a href="/p/${i}">l${i}</a>`), `link ${i}`);
  }
});

test('markdownToHtml: apostrophes and angle brackets in link URLs are escaped exactly once', () => {
  assert.equal(
    markdownToHtml("[x](https://e.com/it's<a>b)"),
    '<p><a href="https://e.com/it&#39;s&lt;a&gt;b">x</a></p>',
  );
});

test('generateVideoLinks: exact markup for two videos, and a hostname-looking platform is rejected', () => {
  assert.equal(
    generateVideoLinks([
      { platform: 'youtube', id: 'a', title: 'A', description: 'da' },
      { platform: 'evil.com/abc', id: 'x', title: 'X', description: 'dx' },
      { platform: 'youtube', id: 'b', title: 'B', description: 'db' },
    ]),
    `<div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #007acc;">
    <h3>Videos in this post:</h3>
    <p><strong>A</strong>: <a href="https://www.youtube.com/watch?v=a">da</a></p><p><strong>B</strong>: <a href="https://www.youtube.com/watch?v=b">db</a></p>
  </div>`,
  );
});
