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
  console.log('Fetching hero setting...');
  const { data: row, error } = await supabase.from('site_settings').select('*').eq('key', 'hero').single();
  if (error) {
    console.error('Error fetching hero:', error);
    return;
  }

  const heroVal = row.value;
  heroVal.role = 'Data Analyst';
  if (heroVal.socials) {
    heroVal.socials.linkedin = 'https://www.linkedin.com/in/arunpandianp-dataanalyst/';
    heroVal.socials.github = 'https://github.com/arun-pandian-p';
  }

  console.log('Saving cleaned hero value:', heroVal);
  const { error: updErr } = await supabase.from('site_settings').update({ value: heroVal }).eq('key', 'hero');
  if (updErr) {
    console.error('Update error:', updErr);
  } else {
    console.log('SUCCESSFULLY updated hero in Supabase!');
  }
}

main();
