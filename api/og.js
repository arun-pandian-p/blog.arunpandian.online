import { createClient } from '@supabase/supabase-js';

const CRAWLER_USER_AGENTS = [
  'whatsapp',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'telegrambot',
  'slackbot',
  'discordbot',
  'skypeuripreview',
  'pinterest',
  'applebot',
  'google-structured-data-testing-tool'
];

export default async function handler(req, res) {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isCrawler = CRAWLER_USER_AGENTS.some(bot => userAgent.includes(bot));

  const { type = 'project', id = '', slug = '', path = '' } = req.query;
  const targetId = String(id || slug || path || '').trim();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let title = 'Arun Pandian | Data Analyst Portfolio';
  let description = 'Portfolio of Arun Pandian, an experienced Data Analyst specializing in Power BI, SQL, Python, and business intelligence.';
  let imageUrl = 'https://arunpandian.online/assets/arun-profile.jpg';
  let canonicalUrl = `https://arunpandian.online`;

  if (supabaseUrl && supabaseKey && targetId) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      if (type === 'project' || path.includes('/project/')) {
        canonicalUrl = `https://arunpandian.online/project/${targetId}`;
        
        // Fetch project from Supabase
        const { data: proj } = await supabase
          .from('projects')
          .select('*')
          .or(`id.eq.${targetId},title.ilike.%${targetId}%`)
          .limit(1)
          .maybeSingle();

        if (proj) {
          title = `${proj.title} | Arun Pandian`;
          description = proj.insight || proj.problem || proj.subtitle || description;
          
          let rawImg = proj.image_url || proj.imageUrl || '';
          if (rawImg.includes('|||')) {
            rawImg = rawImg.split('|||')[0].trim();
          }
          if (rawImg) {
            imageUrl = rawImg.startsWith('http') ? rawImg : `https://arunpandian.online${rawImg}`;
          }
        }
      } else if (type === 'blog' || path.includes('/blog/')) {
        canonicalUrl = `https://arunpandian.online/blog/${targetId}`;
        
        // Fetch blog from Supabase
        const { data: blog } = await supabase
          .from('blogs')
          .select('*')
          .or(`slug.eq.${targetId},id.eq.${targetId}`)
          .limit(1)
          .maybeSingle();

        if (blog) {
          title = `${blog.title} | Arun Pandian`;
          description = blog.excerpt || blog.subtitle || description;
          
          let rawImg = blog.cover_image || blog.coverImage || '';
          if (rawImg) {
            imageUrl = rawImg.startsWith('http') ? rawImg : `https://arunpandian.online${rawImg}`;
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching item for OG tags:', err);
    }
  }

  // Ensure image URL is absolute HTTPS
  if (!imageUrl.startsWith('http')) {
    imageUrl = `https://arunpandian.online${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  // Set HTML headers with cache control for WhatsApp / Facebook / Twitter
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');

  const escapeHtml = (str = '') =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImg = escapeHtml(imageUrl);
  const safeUrl = escapeHtml(canonicalUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- OpenGraph / Facebook / WhatsApp / LinkedIn -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Arun Pandian Data Analytics" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImg}" />
  <meta property="og:image:secure_url" content="${safeImg}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeTitle}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@arunpandian" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImg}" />
  <meta name="twitter:image:alt" content="${safeTitle}" />

  <!-- Canonical -->
  <link rel="canonical" href="${safeUrl}" />

  <!-- Client-side Redirect for humans -->
  <meta http-equiv="refresh" content="0; url=${safeUrl}" />
  <script>
    window.location.replace("${safeUrl}");
  </script>
</head>
<body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #fff; text-align: center;">
  <h2>${safeTitle}</h2>
  <p>${safeDesc}</p>
  <img src="${safeImg}" alt="${safeTitle}" style="max-width: 100%; border-radius: 12px; margin-top: 1rem;" />
  <p style="margin-top: 1.5rem;">Redirecting to <a href="${safeUrl}" style="color: #38bdf8;">${safeUrl}</a>...</p>
</body>
</html>`;

  return res.status(200).send(html);
}
