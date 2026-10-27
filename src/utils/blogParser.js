// Comprehensive Blog & Article Content Parser & Metadata Extraction
export function parseArticleMetadata(blog) {
  if (!blog) return {};
  
  let rawContent = blog.content || '';
  let meta = {
    category: blog.category || 'Data Analytics',
    imageCaption: blog.image_caption || '',
    videoUrl: blog.video_url || '',
    powerbiUrl: blog.powerbi_url || '',
    githubLink: blog.github_link || 'https://github.com/arun-pandian-p',
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

// Consistent, topic-accurate cover image resolver across listings and article details
export function resolveCoverImage(b) {
  if (!b) return '';
  const explicit = b.cover_image || b.coverImage || b.image_url || b.imageUrl || b.image;
  if (explicit && typeof explicit === 'string' && explicit.trim()) {
    const trimmed = explicit.trim();
    if (trimmed !== '/assets/projects/amazon_delivery.png') {
      return trimmed;
    }
  }

  const slug = String(b.slug || b.id || '').toLowerCase();
  const title = String(b.title || '').toLowerCase();

  if (slug.includes('java-21') || title.includes('java 21') || title.includes('spring boot')) {
    return '/assets/blogs/java_spring_cover.jpg';
  }
  if (slug.includes('ap-desktop') || title.includes('ap desktop')) {
    return '/assets/blogs/ap_desktop_cover.jpg';
  }
  if (slug.includes('inbox') || title.includes('inbox') || title.includes('ollama') || title.includes('n8n')) {
    return 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/bl6o93ym18c_1784188015054.png';
  }
  if (slug.includes('salary') || title.includes('salary dashboard')) {
    return 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/t8bk7q5eg7g_1784188043415.png';
  }
  if (slug.includes('job-posting') || title.includes('job-posting')) {
    return 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/4bzfqm82kmd_1784187994669.png';
  }

  return '';
}
