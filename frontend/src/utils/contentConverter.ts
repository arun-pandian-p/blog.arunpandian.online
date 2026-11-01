import { marked } from 'marked';

/**
 * Normalizes article content into clean, semantic WYSIWYG HTML.
 * Converts literal escaped \n, detects legacy Markdown, and produces
 * real HTML nodes (<h2>, <p>, <strong>, <table>, etc.) so Tiptap renders
 * visual document elements without displaying raw Markdown syntax.
 */
export function normalizeContentToHtml(rawContent: string | null | undefined): string {
  if (!rawContent || !rawContent.trim()) {
    return '';
  }

  let text = rawContent;

  // 1. Convert literal escaped "\\r\\n" and "\\n" into real newlines
  text = text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');

  // 2. Ensure markdown headings have newline before body text: e.g. "## Title\nBody"
  text = text.replace(/(^#{1,6}\s+[^\n]+)\n([^\n#])/gm, '$1\n\n$2');

  // 3. Check if content is primarily Markdown or contains markdown syntax
  const isLikelyMarkdown = checkIsMarkdown(text);

  if (isLikelyMarkdown) {
    try {
      const parsed = marked.parse(text, {
        gfm: true,
        breaks: true,
      });
      return typeof parsed === 'string' ? parsed : String(parsed);
    } catch (e) {
      console.warn('Failed to parse markdown with marked:', e);
    }
  }

  // 4. If it's plain text with newlines outside HTML tags, wrap into paragraphs
  if (!text.trim().startsWith('<') && text.includes('\n')) {
    return text
      .split(/\n\s*\n/)
      .map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  return text;
}

/**
 * Determines whether the given string contains Markdown syntax.
 */
function checkIsMarkdown(str: string): boolean {
  if (!str) return false;

  const trimmed = str.trim();
  const startsWithTag = /^<[a-z1-6]+[^>]*>/i.test(trimmed);

  // Markdown indicators
  const markdownHeading = /^#{1,6}\s+.+/m.test(str);
  const markdownBold = /(\*\*|__)[^\s]+.*?\1/.test(str);
  const markdownItalic = /(\*|_)[^\s]+.*?\1/.test(str);
  const markdownList = /^(\s*[-*+]|\s*\d+\.)\s+.+/m.test(str);
  const markdownBlockquote = /^\s*>\s+.+/m.test(str);
  const markdownCodeBlock = /```[\s\S]*?```/.test(str);

  // Dynamic regex to avoid Tailwind CSS build interference
  const tablePattern = '\\|.*?\\|.*?\\n\\|' + String.fromCharCode(91, 45, 58, 92, 115, 92, 124, 93, 43) + '\\|';
  const markdownTable = new RegExp(tablePattern, 'm').test(str);

  if (!startsWithTag && (markdownHeading || markdownBold || markdownItalic || markdownList || markdownBlockquote || markdownCodeBlock || markdownTable)) {
    return true;
  }

  // Edge cases: <p>## Heading</p> or <p>### Introduction</p>
  if (/<p>\s*#{1,6}\s+/i.test(str)) {
    return true;
  }

  return false;
}
