import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let envUrl = '';
let envKey = '';
if (fs.existsSync('.env')) {
  const envText = fs.readFileSync('.env', 'utf-8');
  for (const line of envText.split('\n')) {
    if (line.startsWith('VITE_SUPABASE_URL=')) envUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) envKey = line.split('=')[1].trim().replace(/['"]/g, '');
  }
}

const supabase = createClient(envUrl, envKey);

async function main() {
  console.log('Fetching all keys from site_settings...');
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }

  for (const row of data) {
    const raw = JSON.stringify(row.value);
    if (raw.includes('Specialist') || raw.includes('specialist')) {
      console.log(`Found "Specialist" in key: ${row.key}`);
      console.log('Content:', raw);
      const cleaned = JSON.parse(
        raw.replace(/Data Analyst Specialist/gi, 'Data Analyst')
           .replace(/Analyst Specialist/gi, 'Analyst')
           .replace(/Specialist/gi, '')
           .trim()
      );
      const { error: updErr } = await supabase.from('site_settings').update({ value: cleaned }).eq('key', row.key);
      console.log(`Update result for ${row.key}:`, updErr ? updErr : 'SUCCESS');
    }
  }

  // Also check if any key has "hero" or "navbar" role
  const heroRow = data.find(r => r.key === 'hero');
  console.log('Hero value in DB:', heroRow?.value);
  const navbarRow = data.find(r => r.key === 'navbar');
  console.log('Navbar value in DB:', navbarRow?.value);
}

main();
