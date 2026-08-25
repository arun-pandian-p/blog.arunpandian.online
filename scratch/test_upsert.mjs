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
  console.log('Testing Supabase upsert on site_settings with anon key...');
  const { data: testRead, error: readErr } = await supabase.from('site_settings').select('*').limit(1);
  console.log('Read result:', { readErr, count: testRead?.length });

  const { data: testUpsert, error: upsertErr } = await supabase.from('site_settings').upsert({
    key: 'theme',
    value: { test: 'live-check', timestamp: Date.now() }
  });
  console.log('Upsert result:', { upsertErr });
}

main();
