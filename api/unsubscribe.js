import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to safely unsubscribe an email and record the exit feedback
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, reason } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const unsubscribeReason = reason || 'User requested unsubscribe';

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Mark as unsubscribed in newsletter_subscribers (so they are excluded from broadcasts)
      const { error: subError } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
          unsubscribe_reason: unsubscribeReason
        })
        .eq('email', cleanEmail);

      // 2. Keep exit feedback in contact_messages table for admin inventory logs
      await supabase.from('contact_messages').insert([{
        name: 'Unsubscribed Reader',
        email: cleanEmail,
        subject: `[Newsletter Unsubscribed - ${cleanEmail}]`,
        message: `Reason: ${unsubscribeReason}\nTimestamp: ${new Date().toISOString()}`
      }]).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: `Successfully unsubscribed ${cleanEmail}`
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
