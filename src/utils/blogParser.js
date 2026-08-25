// Comprehensive Blog & Article Content Parser & Metadata Extraction
export function parseArticleMetadata(blog) {
  if (!blog) return {};
  
  let rawContent = blog.content || '';
  let meta = {
    category: blog.category || 'Data Analytics',
    imageCaption: blog.image_caption || '',
    videoUrl: blog.video_url || '',
    powerbiUrl: blog.powerbi_url || '',
    githubLink: blog.github_link || 'https://github.com/shadow-byte-warrior',
    liveLink: blog.live_link || '',
    seoTitle: blog.seo_title || blog.title || '',
    seoDescription: blog.seo_description || blog.excerpt || '',
    socialImage: blog.social_image || blog.cover_image || '',
  };

  // Check for embedded JSON metadata comment at start of content e.g. <!--meta:{...}-->
  if (rawContent.startsWith('<!--meta:')) {
    const endComment = rawContent.indexOf('-->');
    if (endComment !== -1) {
      try {
        const jsonStr = rawContent.substring(9, endComment).trim();
        const parsed = JSON.parse(jsonStr);
        meta = { ...meta, ...parsed };
        rawContent = rawContent.substring(endComment + 3).trim();
      } catch (e) {
        console.error('Failed to parse blog frontmatter meta', e);
      }
    }
  }

  // Fallback category from tags
  if (!meta.category && Array.isArray(blog.tags) && blog.tags.length > 0) {
    meta.category = blog.tags[0];
  }

  return {
    cleanContent: rawContent,
    meta,
  };
}

export function serializeBlogContent(content, meta) {
  // If extra metadata fields exist, serialize them safely in frontmatter comment
  const hasExtraMeta =
    meta.imageCaption ||
    meta.videoUrl ||
    meta.powerbiUrl ||
    meta.githubLink ||
    meta.liveLink ||
    meta.seoTitle ||
    meta.seoDescription ||
    meta.socialImage ||
    meta.category;

  if (hasExtraMeta) {
    const metaStr = JSON.stringify(meta);
    return `<!--meta:${metaStr}-->\n\n${content}`;
  }
  return content;
}

// Extracts headings for Table of Contents
export function extractHeadings(markdownText) {
  if (!markdownText) return [];
  const lines = markdownText.split('\n');
  const headings = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const level = trimmed.startsWith('### ') ? 3 : 2;
      const text = trimmed.replace(/^#{2,3}\s+/, '').replace(/\*\*|\*|`/g, '');
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `section-${index}`;

      headings.push({
        id,
        text,
        level,
      });
    }
  });

  return headings;
}
