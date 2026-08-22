import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file for Supabase URL and Key
const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'hero').single();
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  let hero = data?.value || {};
  
  // Keyword rich copy
  hero.headline = ["Turning Complex", "Datasets into"];
  hero.headlineAccent = "Decisions";
  hero.subtitle = "Hi, I'm Arun Pandian — a Data Analyst specializing in SQL, Python, Excel & Power BI. I help businesses scale by extracting actionable intelligence from unstructured data.";
  hero.badge = "Arun Pandian · Data Analyst";
  hero.primaryCta = { label: 'Explore Featured Projects', href: '#projects' };

  const { error: updateError } = await supabase.from('site_settings').upsert({ key: 'hero', value: hero });
  if (updateError) {
    console.error('Error updating:', updateError);
  } else {
    console.log('Hero settings updated successfully in Supabase!');
  }
}

run();
