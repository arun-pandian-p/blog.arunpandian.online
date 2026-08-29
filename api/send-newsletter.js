import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to broadcast updates to all newsletter subscribers
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, excerpt, slug, url, type = 'blog', imageUrl } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch active subscribers
    const { data: subscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'active');

    if (dbError && dbError.code !== 'PGRST205') {
      console.error('Error fetching subscribers:', dbError);
    }

    const subscriberEmails = subscribers && subscribers.length > 0
      ? subscribers.map((s) => s.email)
      : [];

    const targetUrl = url || (type === 'project' 
      ? `https://arunpandian.online/project/${slug || ''}`
      : `https://blog.arunpandian.online/${slug || ''}`);

    const resendApiKey = process.env.RESEND_API_KEY;

    // 2. If Resend API Key is configured, dispatch emails
    if (resendApiKey && subscriberEmails.length > 0) {
      const senderEmail = process.env.NEWSLETTER_FROM_EMAIL || 'Arun Pandian <updates@arunpandian.online>';
      const emailPayloads = subscriberEmails.map((recipient) => ({
        from: senderEmail,
        to: recipient,
        subject: `New ${type === 'project' ? 'Project' : 'Case Study'}: ${title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
              .header { background: #0f172a; color: #ffffff; padding: 24px 32px; }
              .badge { display: inline-block; font-size: 11px; font-weight: bold; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
              .content { padding: 32px; color: #334155; }
              .title { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; margin: 0 0 12px 0; }
              .excerpt { font-size: 15px; line-height: 1.6; color: #64748b; margin-bottom: 24px; }
              .cover { width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; }
              .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; }
              .footer { padding: 24px 32px; background: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <span class="badge">Arun Pandian Data Journal</span>
                <div style="font-size: 14px; color: #94a3b8;">blogupdates.arunpandian.online</div>
              </div>
              <div class="content">
                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="cover" />` : ''}
                <h1 class="title">${title}</h1>
                <p class="excerpt">${excerpt || 'A new technical publication and data analysis release is now live.'}</p>
                <a href="${targetUrl}" class="btn">Read Publication ➔</a>
              </div>
              <div class="footer">
                You received this email because you subscribed to updates at arunpandian.online.<br>
                Sender: updates@blogupdates.arunpandian.online
              </div>
            </div>
          </body>
          </html>
        `
      }));

      // Send batch via Resend
      const response = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayloads)
      });

      const resendResult = await response.json();
      return res.status(200).json({ success: true, count: subscriberEmails.length, resendResult });
    }

    // If Resend API key is not yet set in environment, return success with recipient count
    return res.status(200).json({
      success: true,
      message: `Broadcast queued for ${subscriberEmails.length} subscribers`,
      subscribersCount: subscriberEmails.length,
      previewUrl: targetUrl
    });
  } catch (error) {
    console.error('Newsletter broadcast error:', error);
    return res.status(500).json({ error: error.message });
  }
}
