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
  console.log('Fetching site_settings from Supabase...');
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.error('Error fetching site_settings:', error);
    return;
  }

  for (const row of data) {
    const raw = JSON.stringify(row.value);
    if (raw.includes('Specialist') || raw.includes('specialist')) {
      console.log(`Found Specialist in key: ${row.key}`);
      const updatedStr = raw
        .replace(/Data Analyst Specialist/gi, 'Data Analyst')
        .replace(/Data Analyst · BI & Modeling Specialist/gi, 'Data Analyst')
        .replace(/Data Analyst · BI Specialist/gi, 'Data Analyst')
        .replace(/BI Specialist/gi, 'Data Analyst')
        .replace(/Specialist/gi, '');
      const updatedValue = JSON.parse(updatedStr);
      const { error: updErr } = await supabase.from('site_settings').update({ value: updatedValue }).eq('key', row.key);
      if (updErr) console.error(`Error updating ${row.key}:`, updErr);
      else console.log(`Successfully updated ${row.key}!`);
    }
  }

  console.log('Done checking Supabase.');
}

main();
