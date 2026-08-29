// Vercel Serverless Function to dispatch automated Welcome & Introduction email to new subscribers
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not configured');
      return res.status(200).json({ success: true, message: 'Simulated welcome dispatch (key missing)' });
    }

    const senderEmail = process.env.NEWSLETTER_FROM_EMAIL || 'Arun Pandian <updates@arunpandian.online>';

    const emailPayload = {
      from: senderEmail,
      to: [email],
      subject: `Welcome to Arun Pandian's Data Journal 👋 (Here's what to expect)`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Arun Pandian's Data Journal</title>
          <style>
            body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
            .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); }
            .header { background: #0f172a; padding: 36px 32px; color: #ffffff; text-align: center; }
            .header-tag { font-family: monospace; font-size: 11px; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; margin-bottom: 8px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; line-height: 1.3; }
            .content { padding: 32px; font-size: 15px; line-height: 1.7; color: #334155; }
            .highlight-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 24px 0; font-size: 14px; }
            .pill-list { list-style: none; padding: 0; margin: 20px 0; }
            .pill-list li { padding: 8px 0; display: flex; align-items: center; gap: 8px; }
            .btn-primary { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; text-align: center; margin-right: 12px; margin-bottom: 10px; }
            .btn-secondary { display: inline-block; background: #f8fafc; color: #0f172a !important; text-decoration: none; padding: 13px 26px; border-radius: 12px; font-weight: bold; font-size: 14px; border: 1px solid #cbd5e1; text-align: center; }
            .footer { background: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; }
            .social-links a { color: #2563eb; text-decoration: none; margin: 0 8px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            
            <!-- Header -->
            <div class="header">
              <div class="header-tag">✦ Welcome to the Publication</div>
              <h1>Thanks for Subscribing! 👋</h1>
            </div>

            <!-- Content -->
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">
                Hi there,
              </p>
              <p>
                I'm <strong>Arun Pandian</strong> — a Data Analyst &amp; BI Engineer. I build end-to-end data analytics solutions, high-throughput SQL pipelines, and production Power BI architectures.
              </p>

              <div class="highlight-box">
                <strong>What you'll receive in this journal:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 18px; line-height: 1.6;">
                  <li><strong>Real-World Case Studies</strong>: In-depth breakdowns of ETL workflows &amp; exploratory data analysis.</li>
                  <li><strong>SQL &amp; DAX Blueprints</strong>: Production query optimizations and semantic modeling techniques.</li>
                  <li><strong>Interactive Dashboard Releases</strong>: Direct access to newly shipped Power BI reports and portfolio projects.</li>
                </ul>
              </div>

              <p>
                Every dispatch is zero-fluff, hands-on, and focused on turning messy data into decisions people trust.
              </p>

              <!-- Action Buttons -->
              <div style="margin: 32px 0 20px 0;">
                <a href="https://blog.arunpandian.online" class="btn-primary">Explore Latest Case Studies ➔</a>
                <a href="https://arunpandian.online" class="btn-secondary">View Main Portfolio ↗</a>
              </div>

              <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
                Have any questions or looking to collaborate? Just hit reply to this email — I read and answer every message.
              </p>

              <p style="margin-bottom: 0;">
                Warm regards,<br>
                <strong>Arun Pandian</strong><br>
                <span style="font-size: 12px; color: #64748b;">Data Analyst · Coimbatore, India</span>
              </p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="social-links" style="margin-bottom: 12px;">
                <a href="https://arunpandian.online">Portfolio</a> •
                <a href="https://blog.arunpandian.online">Data Journal</a> •
                <a href="https://github.com/arun-pandian-p">GitHub</a> •
                <a href="https://www.linkedin.com/in/arunpandianp-dataanalyst/">LinkedIn</a>
              </div>
              <p style="margin: 0;">
                You received this because you subscribed at arunpandian.online or blog.arunpandian.online.<br>
                Dispatched from <code>updates@arunpandian.online</code>
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
      text: `Hi there! Thanks for subscribing to Arun Pandian's Data Journal. I'm Arun Pandian, a Data Analyst specializing in SQL, Python, Excel & Power BI. You'll receive direct updates whenever new case studies, data pipelines, and dashboards are published. Explore the journal at https://blog.arunpandian.online or visit my portfolio at https://arunpandian.online.`
    };

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    const resendData = await resendRes.json();
    return res.status(200).json({ success: true, resendData });

  } catch (error) {
    console.error('Welcome email dispatch error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
