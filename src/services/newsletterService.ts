import { supabase } from '../lib/supabaseClient';

export interface BroadcastNotificationParams {
  title: string;
  excerpt?: string;
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
    const res = await fetch('/api/send-newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Failed to trigger broadcast: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.warn('Newsletter broadcast notice:', error?.message || error);
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
