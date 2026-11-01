export interface FontOption {
  name: string;
  family: string;
  category: 'sans' | 'serif' | 'mono';
}

export const FONT_FAMILIES: FontOption[] = [
  // Sans-Serif (Modern / Google Docs style)
  { name: 'Inter (System Default)', family: 'Inter, sans-serif', category: 'sans' },
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'sans' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'sans' },
  { name: 'Poppins', family: 'Poppins, sans-serif', category: 'sans' },
  { name: 'Open Sans', family: "'Open Sans', sans-serif", category: 'sans' },
  { name: 'Lato', family: 'Lato, sans-serif', category: 'sans' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'sans' },
  { name: 'Nunito', family: 'Nunito, sans-serif', category: 'sans' },
  { name: 'Raleway', family: 'Raleway, sans-serif', category: 'sans' },

  // Serif (Editorial / Word / Book style)
  { name: 'Merriweather (Editorial)', family: 'Merriweather, serif', category: 'serif' },
  { name: 'Playfair Display (Elegant)', family: "'Playfair Display', serif", category: 'serif' },
  { name: 'Lora (Literary)', family: 'Lora, serif', category: 'serif' },
  { name: 'PT Serif', family: "'PT Serif', serif", category: 'serif' },
  { name: 'Georgia (Classic)', family: 'Georgia, serif', category: 'serif' },
  { name: 'Garamond', family: 'Garamond, serif', category: 'serif' },
  { name: 'Cinzel (Display)', family: 'Cinzel, serif', category: 'serif' },

  // Monospace (Engineering / Code)
  { name: 'JetBrains Mono (Dev)', family: "'JetBrains Mono', monospace", category: 'mono' },
  { name: 'Fira Code (Ligatures)', family: "'Fira Code', monospace", category: 'mono' },
  { name: 'Source Code Pro', family: "'Source Code Pro', monospace", category: 'mono' },
  { name: 'Space Mono', family: "'Space Mono', monospace", category: 'mono' },
  { name: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace", category: 'mono' },
  { name: 'Inconsolata', family: 'Inconsolata, monospace', category: 'mono' },
];

export const FONT_SIZES = [
  { label: '10 pt', value: '13px' },
  { label: '11 pt', value: '15px' },
  { label: '12 pt (Normal)', value: '16px' },
  { label: '14 pt', value: '18px' },
  { label: '16 pt', value: '21px' },
  { label: '18 pt', value: '24px' },
  { label: '24 pt', value: '32px' },
  { label: '30 pt', value: '40px' },
  { label: '36 pt', value: '48px' },
];

export const LINE_SPACINGS = [
  { label: 'Single (1.0)', value: '1.2' },
  { label: 'Compact (1.15)', value: '1.45' },
  { label: 'Standard (1.5)', value: '1.75' },
  { label: 'Double (2.0)', value: '2.2' },
];

export const CODE_LANGUAGES = [
  { label: 'Plaintext', value: 'plaintext' },
  { label: 'Java', value: 'java' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Rust', value: 'rust' },
  { label: 'Go', value: 'go' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'SQL', value: 'sql' },
  { label: 'JSON', value: 'json' },
  { label: 'HTML / XML', value: 'xml' },
  { label: 'CSS / SCSS', value: 'css' },
  { label: 'YAML', value: 'yaml' },
];

export const COLOR_PALETTE = [
  { name: 'Automatic / Black', value: 'inherit' },
  { name: 'Charcoal', value: '#334155' },
  { name: 'Forest Emerald', value: '#15803d' },
  { name: 'Cobalt Blue', value: '#1d4ed8' },
  { name: 'Purple', value: '#7e22ce' },
  { name: 'Crimson Red', value: '#b91c1c' },
  { name: 'Dark Amber', value: '#b45309' },
  { name: 'Teal', value: '#0f766e' },
];

export const HIGHLIGHT_PALETTE = [
  { name: 'No Color', value: '' },
  { name: 'Yellow (Standard)', value: '#fef08a' },
  { name: 'Lime Green', value: '#bbf7d0' },
  { name: 'Cyan Blue', value: '#a5f3fc' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Soft Orange', value: '#fed7aa' },
];
