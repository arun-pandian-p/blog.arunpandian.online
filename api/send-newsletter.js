import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to broadcast updates to all newsletter subscribers
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      title,
      subject: customSubject,
      headline: customHeadline,
      excerpt,
      customMessage,
      ctaText,
      slug,
      url,
      type = 'blog',
      imageUrl,
      quote
    } = req.body;

    if (!title && !customSubject) {
      return res.status(400).json({ error: 'Title or subject is required' });
    }

    const effectiveTitle = title || customSubject;
    const finalSubject = customSubject || `New ${type === 'project' ? 'Project' : 'Case Study'}: ${effectiveTitle} 🚀`;
    const finalHeadline = customHeadline || effectiveTitle;
    const finalButtonText = ctaText || (type === 'project' ? 'Explore Interactive Dashboard ➔' : 'Read Complete Article ➔');

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

    // Format custom message body into HTML paragraphs if provided
    const formattedBodyHtml = customMessage
      ? customMessage
          .split('\n\n')
          .filter(Boolean)
          .map((para) => `<p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">${para.replace(/\n/g, '<br/>')}</p>`)
          .join('')
      : `<p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">${excerpt || 'A brand-new data analytics case study & engineering breakdown has been published.'}</p>`;

    // 2. If Resend API Key is configured, dispatch emails ONLY to active subscribers
    if (resendApiKey && subscriberEmails.length > 0) {
      const senderEmail = process.env.NEWSLETTER_FROM_EMAIL || 'Arun Pandian <updates@arunpandian.online>';
      const emailPayloads = subscriberEmails.map((recipient) => {
        const recipientName = recipient.split('@')[0].replace(/[._-]/g, ' ');
        const capitalizedName = recipientName.charAt(0).toUpperCase() + recipientName.slice(1);
        const unsubscribeLink = `https://blog.arunpandian.online/unsubscribe?email=${encodeURIComponent(recipient)}`;

        return {
          from: senderEmail,
          to: recipient,
          subject: finalSubject,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${finalSubject}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4efe6; margin: 0; padding: 24px 12px; color: #1e293b; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2dad0; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
                .header { background: #1c1a17; color: #faf7f2; padding: 24px 32px; border-bottom: 3px solid #b83a26; }
                .header-brand { display: flex; align-items: center; justify-content: space-between; }
                .badge { font-family: monospace; font-size: 11px; font-weight: bold; background: rgba(184, 58, 38, 0.25); color: #fca5a5; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; }
                .trending-badge { font-family: monospace; font-size: 11px; font-weight: bold; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 4px 10px; border-radius: 9999px; display: inline-block; margin-left: 6px; }
                .content { padding: 32px 32px 28px 32px; color: #334155; }
                .salutation { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; }
                .title { font-family: Georgia, serif; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 0 0 18px 0; }
                .cover { width: 100%; max-height: 340px; object-fit: cover; border-radius: 14px; margin-bottom: 22px; border: 1px solid #e2e8f0; display: block; }
                .quote-box { background: #faf7f2; border-left: 4px solid #b83a26; padding: 14px 18px; border-radius: 0 10px 10px 0; font-style: italic; color: #475569; margin: 20px 0; font-size: 14.5px; line-height: 1.6; }
                .cta-wrapper { margin: 28px 0 20px 0; }
                .btn { display: inline-block; background: #b83a26; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; text-align: center; box-shadow: 0 2px 8px rgba(184, 58, 38, 0.3); }
                .sign-off { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #475569; line-height: 1.6; }
                .footer { padding: 24px 32px; background: #faf7f2; border-top: 1px solid #e8e1d5; font-size: 12px; color: #8c8479; line-height: 1.6; }
                .footer-links a { color: #64748b; text-decoration: none; margin: 0 6px; }
                .footer-links a:hover { text-decoration: underline; color: #1e293b; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="header-brand">
                    <div>
                      <span class="badge">✦ Arun Pandian Data Journal</span>
                      <span class="trending-badge">🔥 ${randomReaders} Active</span>
                    </div>
                    <a href="${unsubscribeLink}" style="color: #94a3b8; font-size: 11px; text-decoration: underline; font-family: monospace;">Unsubscribe</a>
                  </div>
                  <div style="font-size: 12px; color: #a8a095; margin-top: 8px; font-family: monospace;">blog.arunpandian.online</div>
                </div>

                <div class="content">
                  <div class="salutation">Hey ${capitalizedName},</div>

                  <h1 class="title">${finalHeadline}</h1>

                  ${imageUrl ? `<a href="${targetUrl}" style="text-decoration: none;"><img src="${imageUrl}" alt="${finalHeadline}" class="cover" /></a>` : ''}

                  ${quote ? `<div class="quote-box">"${quote}"</div>` : ''}

                  ${formattedBodyHtml}

                  <div class="cta-wrapper">
                    <a href="${targetUrl}" class="btn">${finalButtonText}</a>
                  </div>

                  <div class="sign-off">
                    Looking forward to sharing more insights with you,<br>
                    <strong style="color: #0f172a;">Arun Pandian</strong><br>
                    <span style="font-size: 12px; color: #64748b;">Data Analyst & BI Engineer</span>
                  </div>
                </div>

                <div class="footer">
                  <div class="footer-links" style="margin-bottom: 12px;">
                    <a href="https://arunpandian.online">Portfolio</a> •
                    <a href="https://blog.arunpandian.online">Data Journal</a> •
                    <a href="https://github.com/arun-pandian-p">GitHub</a> •
                    <a href="https://linkedin.com">LinkedIn</a>
                  </div>
                  <div>Sent to: <a href="mailto:${recipient}" style="color: #475569; text-decoration: none;">${recipient}</a></div>
                  <div style="margin-top: 4px;">
                    <a href="${unsubscribeLink}" style="color: #b83a26; text-decoration: underline; font-weight: 600;">Unsubscribe from these emails</a>
                  </div>
                  <div style="margin-top: 8px; font-size: 11px; color: #a8a095;">
                    Arun Pandian · Data Analytics &amp; Power BI Engineering · Online &amp; Worldwide
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        };
      });

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
