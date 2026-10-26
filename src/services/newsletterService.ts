import { supabase } from '../lib/supabaseClient';

export interface BroadcastNotificationParams {
  title: string;
  subject?: string;
  headline?: string;
  excerpt?: string;
  customMessage?: string;
  ctaText?: string;
  quote?: string;
  slug?: string;
  url?: string;
  type?: 'blog' | 'project';
  imageUrl?: string;
}

/**
 * Dispatch an email broadcast to all subscribed readers when a blog or project is published/updated
 */
export async function sendSubscriberBroadcast(params: BroadcastNotificationParams): Promise<{
  success: boolean;
  message?: string;
  subscribersCount?: number;
}> {
  try {
    const token = localStorage.getItem('arun_admin_jwt');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/newsletter/broadcast', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subject: params.subject || params.title,
        content: params.customMessage || params.excerpt || params.title,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to trigger broadcast: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, subscribersCount: data.recipientsCount };
  } catch (error: any) {
    console.warn('Newsletter broadcast notice:', error?.message || error);
    return { success: false, message: error?.message };
  }
}

/**
 * Dispatch an automated welcome and introduction email to a new subscriber
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const res = await fetch('/api/send-welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send welcome email: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.warn('Welcome email notice:', error?.message || error);
    return { success: false, message: error?.message };
  }
}

/**
 * Fetch total count of active newsletter subscribers
 */
export async function getSubscribersCount(): Promise<number> {
  if (!supabase) return 0;
  try {
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) {
      // Fallback check in contact_messages
      const { count: contactCount } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('subject', '[Newsletter Subscription]');
      return contactCount || 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}
