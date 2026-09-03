import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials missing' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // ─── GET: Fetch all comments for a project or blog ───
  if (req.method === 'GET') {
    try {
      const { targetSlug, targetId, entityType } = req.query;
      const cleanSlug = String(targetSlug || '').trim();
      const cleanId = String(targetId || '').trim();

      // Query contact_messages with secret key (bypasses RLS to read community comments)
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ error: error.message });
      }

      // Filter messages relevant to this project or blog
      const matched = (data || []).filter((m) => {
        const sub = (m.subject || '').toLowerCase();
        if (!sub.includes('comment')) return false;

        // If specific ID or slug passed, match them
        if (cleanSlug && sub.includes(cleanSlug.toLowerCase())) return true;
        if (cleanId && sub.includes(cleanId.toLowerCase())) return true;

        // If targetId is numeric or uuid, match without dashes too
        if (cleanId && sub.includes(cleanId.replace(/-/g, '').toLowerCase())) return true;

        return false;
      });

      const parsedComments = matched.map((m) => {
        let domain = '';
        let body = m.message || '';
        if (body.startsWith('Domain: ')) {
          const parts = body.split('\n');
          domain = parts[0].replace('Domain: ', '').trim();
          body = parts.slice(1).join('\n').trim();
        }
        return {
          id: m.id,
          author_name: m.name,
          author_domain: domain,
          content: body,
          created_at: m.created_at,
          likes: 0
        };
      });

      return res.status(200).json({
        success: true,
        comments: parsedComments,
        count: parsedComments.length
      });
    } catch (err) {
      console.error('Comments GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ─── POST: Submit a new comment ───
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { 
        blog_slug, 
        blog_id, 
        blog_title, 
        author_name, 
        author_domain, 
        content, 
        entityType = 'project' 
      } = body;

      const cleanName = (author_name || '').trim();
      const cleanDomain = (author_domain || '').trim().replace(/^https?:\/\//, '');
      const cleanContent = (content || '').trim();
      const targetSlug = blog_slug || blog_id || 'general';

      if (!cleanName || !cleanContent) {
        return res.status(400).json({ error: 'Name and content are required' });
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: cleanName,
          email: cleanDomain ? `user@${cleanDomain}` : 'reader@arunpandian.online',
          subject: `[${entityType === 'project' ? 'Project' : 'Blog'} Comment - ${targetSlug}]`,
          message: `${cleanDomain ? `Domain: ${cleanDomain}\n` : ''}${cleanContent}`,
          read: false
        }])
        .select();

      if (error) {
        console.error('Error inserting comment:', error);
        return res.status(500).json({ error: error.message });
      }

      const createdRow = data && data[0];
      const newComment = {
        id: createdRow?.id || Date.now(),
        blog_slug: targetSlug,
        blog_id: blog_id,
        blog_title: blog_title,
        author_name: cleanName,
        author_domain: cleanDomain,
        content: cleanContent,
        created_at: createdRow?.created_at || new Date().toISOString(),
        likes: 0
      };

      return res.status(200).json({
        success: true,
        comment: newComment
      });
    } catch (err) {
      console.error('Comments POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
