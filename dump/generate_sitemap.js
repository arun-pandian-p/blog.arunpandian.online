import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient('https://secxgzharggytkevlvmx.supabase.co', 'sb_publishable_27bNUE9GwneWMtdEseUgng_PGepTvZo');

async function run() {
  const { data: projects } = await supabase.from('projects').select('id, title, image_url');
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://arunpandian.online/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

  for (const p of projects || []) {
    sitemap += `  <url>
    <loc>https://arunpandian.online/project/${p.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>\n`;
    
    if (p.image_url) {
      // Escape special XML characters
      const safeLoc = p.image_url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeTitle = p.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      sitemap += `    <image:image>
      <image:loc>${safeLoc}</image:loc>
      <image:title>${safeTitle}</image:title>
    </image:image>\n`;
    }
    sitemap += `  </url>\n`;
  }

  sitemap += `</urlset>\n`;
  
  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log("Sitemap generated successfully with images included.");
}

run();
