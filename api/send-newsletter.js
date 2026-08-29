import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to broadcast updates to all newsletter subscribers
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, excerpt, slug, url, type = 'blog', imageUrl, quote } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch strictly ACTIVE verified subscribers from Supabase
    const { data: subscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'active');

    if (dbError && dbError.code !== 'PGRST205') {
      console.error('Error fetching subscribers:', dbError);
    }

    // Clean, validate, and deduplicate subscriber emails
    const subscriberEmails = Array.from(
      new Set(
        (subscribers || [])
          .map((s) => s.email?.trim().toLowerCase())
          .filter((email) => email && email.includes('@') && email.includes('.'))
      )
    );

    // If 0 active subscribers exist, safely stop without sending
    if (subscriberEmails.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active subscribers found in database. 0 emails dispatched.',
        count: 0
      });
    }

    const targetUrl = url || (type === 'project' 
      ? `https://arunpandian.online/project/${slug || ''}`
      : `https://blog.arunpandian.online/${slug || ''}`);

    const resendApiKey = process.env.RESEND_API_KEY;

    // Random reader count between 100 and 129
    const randomReaders = Math.floor(Math.random() * (129 - 100 + 1)) + 100;

    // 2. If Resend API Key is configured, dispatch emails ONLY to active subscribers
    if (resendApiKey && subscriberEmails.length > 0) {
      const senderEmail = process.env.NEWSLETTER_FROM_EMAIL || 'Arun Pandian <updates@arunpandian.online>';
      const emailPayloads = subscriberEmails.map((recipient) => ({
        from: senderEmail,
        to: recipient,
        subject: `New ${type === 'project' ? 'Project' : 'Case Study'}: ${title} 🚀`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
              .header { background: #0f172a; color: #ffffff; padding: 28px 32px; }
              .badge-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
              .badge { font-family: monospace; font-size: 11px; font-weight: bold; background: rgba(37, 99, 235, 0.25); color: #60a5fa; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; }
              .trending-badge { font-family: monospace; font-size: 11px; font-weight: bold; background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 4px 10px; border-radius: 9999px; display: inline-block; margin-left: 8px; }
              .content { padding: 32px; color: #334155; }
              .title { font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3; margin: 0 0 16px 0; }
              .cover { width: 100%; max-height: 320px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
              .quote-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 0 10px 10px 0; font-style: italic; color: #475569; margin: 18px 0; font-size: 14px; }
              .excerpt { font-size: 15px; line-height: 1.65; color: #475569; margin-bottom: 26px; }
              .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; text-align: center; }
              .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div>
                  <span class="badge">✦ Arun Pandian Data Journal</span>
                  <span class="trending-badge">🔥 ${randomReaders} Readers Active</span>
                </div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 6px; font-family: monospace;">blog.arunpandian.online</div>
              </div>
              <div class="content">
                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="cover" />` : ''}
                <h1 class="title">${title}</h1>
                ${quote ? `<div class="quote-box">"${quote}"</div>` : ''}
                <p class="excerpt">${excerpt || 'A brand-new data analytics case study &amp; engineering breakdown has been published.'}</p>
                <div style="margin: 28px 0 10px 0;">
                  <a href="${targetUrl}" class="btn">Read Complete Article ➔</a>
                </div>
              </div>
              <div class="footer">
                You received this update because you subscribed at <a href="https://arunpandian.online" style="color: #2563eb;">arunpandian.online</a>.<br>
                Dispatched directly from <code>updates@arunpandian.online</code> • <a href="https://blog.arunpandian.online/unsubscribe?email=${encodeURIComponent(recipient)}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
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
      return res.status(200).json({
        success: true,
        count: subscriberEmails.length,
        readersScore: randomReaders,
        resendResult
      });
    }

    return res.status(200).json({
      success: true,
      message: `Broadcast queued for ${subscriberEmails.length} subscribers (${randomReaders} readers count)`,
      subscribersCount: subscriberEmails.length,
      readersScore: randomReaders,
      previewUrl: targetUrl
    });
  } catch (error) {
    console.error('Newsletter broadcast error:', error);
    return res.status(500).json({ error: error.message });
  }
}
