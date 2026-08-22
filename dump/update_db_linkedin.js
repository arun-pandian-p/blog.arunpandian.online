import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://secxgzharggytkevlvmx.supabase.co', 'sb_publishable_27bNUE9GwneWMtdEseUgng_PGepTvZo');

async function run() {
  const { data } = await supabase.from('settings').select('content').eq('id', 1).single();
  if (data) {
    let c = data.content;
    if (c.hero && c.hero.socials) {
      c.hero.socials.linkedin = 'https://linkedin.com/in/arunpandianp-dataanalyst';
      await supabase.from('settings').update({ content: c }).eq('id', 1);
      console.log('Database updated!');
    }
  }
}
run();
