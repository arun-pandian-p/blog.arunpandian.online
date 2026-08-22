import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import toast from 'react-hot-toast';

export function useSiteSettings(key) {
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!supabase) {
      setLoading(false);
      return null;
    }
    try {
      const { data: row, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return row?.value || null;
    } catch (err) {
      console.error(`Error fetching settings for ${key}:`, err);
      toast.error('Failed to load settings');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (value) => {
    if (!supabase) {
      console.warn('Supabase client not initialized - saving to localStorage fallback');
      try {
        localStorage.setItem(`site_settings_${key}`, JSON.stringify(value));
        toast.success('Settings saved locally (Supabase offline)');
        return true;
      } catch (e) {
        toast.error('Failed to save settings locally');
        return false;
      }
    }
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value });
      
      if (error) throw error;
      toast.success('Settings saved successfully');
      return true;
    } catch (err) {
      console.error(`Error saving settings for ${key}:`, err);
      toast.error('Failed to save settings');
      return false;
    }
  };

  return { fetchSettings, saveSettings, loading };
}
