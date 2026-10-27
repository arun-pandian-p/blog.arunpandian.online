/**
 * Vercel Serverless Function: Social Media Crawler HTML Pre-renderer
 * Generates Open Graph, Twitter Cards, and Article structured tags for WhatsApp,
 * LinkedIn, X/Twitter, Facebook, Telegram, Slack, and Discord crawlers.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ybnamsnooymffjsgrsao.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlibmFtc25vb3ltZmZqc2dyc2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDA0NDIsImV4cCI6MjEwNzgxNjQ0Mn0.szPNW-pqLYla9-8rmkwSolaD0H70eu67RlgzuUvjBRA';

const DEFAULT_IMAGE = 'https://blog.arunpandian.online/assets/arun-profile.jpg';
const SITE_NAME = 'blog.arunpandian.online';
const BASE_URL = 'https://blog.arunpandian.online';

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  const { slug, id, type } = req.query;
  const targetSlug = slug || id;

  if (!targetSlug) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${SITE_NAME} — Tech &amp; Engineering Publication</title>
        <meta name="description" content="Independent publication covering software engineering, systems, cloud architecture, and modern full-stack development.">
        <link rel="canonical" href="${BASE_URL}">
        <meta property="og:site_name" content="${SITE_NAME}">
        <meta property="og:title" content="${SITE_NAME} — Tech &amp; Engineering Publication">
        <meta property="og:description" content="Independent publication covering software engineering, systems, cloud architecture, and modern full-stack development.">
        <meta property="og:url" content="${BASE_URL}">
        <meta property="og:type" content="website">
        <meta property="og:image" content="${DEFAULT_IMAGE}">
        <meta name="twitter:card" content="summary_large_image">
        <meta http-equiv="refresh" content="0;url=${BASE_URL}">
      </head>
      <body>
        <h1>${SITE_NAME}</h1>
        <p><a href="${BASE_URL}">Go to publication feed &rarr;</a></p>
      </body>
      </html>
    `);
  }

  try {
    // Check if targetSlug is UUID to avoid PostgREST invalid UUID syntax error
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetSlug);
    const filter = isUuid 
      ? `or=(slug.eq.${encodeURIComponent(targetSlug)},id.eq.${encodeURIComponent(targetSlug)})` 
      : `slug=eq.${encodeURIComponent(targetSlug)}`;

    const queryUrl = `${SUPABASE_URL}/rest/v1/blogs?${filter}&status=eq.PUBLISHED&select=id,title,excerpt,cover_image,slug,author_name,published_at,category,tags&limit=1`;
    
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    const response = await fetch(queryUrl, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    const blog = Array.isArray(data) && data.length > 0 ? data[0] : null;

    if (!blog) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Article Not Found — ${SITE_NAME}</title>
          <meta name="robots" content="noindex, nofollow">
          <meta http-equiv="refresh" content="0;url=${BASE_URL}/blog">
        </head>
        <body>
          <h1>Article Not Found</h1>
          <p>The requested publication was not found or is currently private.</p>
          <p><a href="${BASE_URL}/blog">Browse published articles &rarr;</a></p>
        </body>
        </html>
      `);
    }

    const title = escapeHtml(blog.title || 'Article');
    const rawExcerpt = blog.excerpt || blog.summary || 'Read this article on blog.arunpandian.online.';
    let excerpt = escapeHtml(rawExcerpt.replace(/<[^>]*>/g, '').trim());
    if (excerpt.length > 200) {
      excerpt = excerpt.slice(0, 197) + '...';
    }

    const canonicalUrl = `${BASE_URL}/posts/${blog.slug || blog.id}`;
    let coverImage = DEFAULT_IMAGE;
    if (blog.cover_image && blog.cover_image.trim()) {
      const img = blog.cover_image.trim();
      coverImage = img.startsWith('http') ? img : `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
    }

    const author = escapeHtml(blog.author_name || 'Arun Pandian');
    const publishedTime = blog.published_at ? new Date(blog.published_at).toISOString() : '';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} — ${SITE_NAME}</title>
        <meta name="description" content="${excerpt}">
        <link rel="canonical" href="${canonicalUrl}">
        <meta name="author" content="${author}">
        <meta property="og:site_name" content="${SITE_NAME}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${excerpt}">
        <meta property="og:url" content="${canonicalUrl}">
        <meta property="og:type" content="article">
        <meta property="og:image" content="${coverImage}">
        <meta property="og:image:secure_url" content="${coverImage}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}
        <meta property="article:author" content="${author}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${excerpt}">
        <meta name="twitter:image" content="${coverImage}">
        <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
        <script>window.location.replace("${canonicalUrl}");</script>
      </head>
      <body style="font-family: sans-serif; max-width: 680px; margin: 40px auto; padding: 0 16px; color: #1C1A17;">
        <h1>${title}</h1>
        <p style="color: #6E665C; font-size: 1.1em;">${excerpt}</p>
        <p><strong>Author:</strong> ${author}</p>
        <p><a href="${canonicalUrl}" style="color: #B83A26;">Read the full article on ${SITE_NAME} &rarr;</a></p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('OG generation error:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${SITE_NAME}</title>
        <meta http-equiv="refresh" content="0;url=${BASE_URL}">
      </head>
      <body>
        <h1>${SITE_NAME}</h1>
        <p><a href="${BASE_URL}">Go to publication feed</a></p>
      </body>
      </html>
    `);
  }
}
