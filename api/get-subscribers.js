import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials missing' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch newsletter subscribers (excluding unsubscribed)
    const { data: subs } = await supabase
      .from('newsletter_subscribers')
      .select('email, created_at, status, source')
      .neq('status', 'unsubscribed');

    // 2. Fetch contact messages
    const { data: contacts } = await supabase
      .from('contact_messages')
      .select('email, created_at, name')
      .order('created_at', { ascending: false });

    const emailMap = new Map();

    (subs || []).forEach((s) => {
      const em = s.email?.trim().toLowerCase();
      if (em && em.includes('@') && em.includes('.')) {
        emailMap.set(em, {
          email: em,
          source: s.source || 'Newsletter',
          status: s.status || 'active',
          created_at: s.created_at || new Date().toISOString()
        });
      }
    });

    (contacts || []).forEach((c) => {
      const em = c.email?.trim().toLowerCase();
      if (em && em.includes('@') && em.includes('.') && !emailMap.has(em)) {
        emailMap.set(em, {
          email: em,
          source: 'Contact Form',
          status: 'active',
          name: c.name,
          created_at: c.created_at || new Date().toISOString()
        });
      }
    });

    const allSubscribers = Array.from(emailMap.values());

    return res.status(200).json({
      success: true,
      subscribers: allSubscribers,
      count: allSubscribers.length
    });
  } catch (error) {
    console.error('Error fetching subscribers list:', error);
    return res.status(500).json({ error: error.message });
  }
}
