export interface ThemeState {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    accent?: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    bodySize: string;
    headingSize: string;
    bodyWeight: string;
    headingWeight: string;
  };
  layout: {
    radius: string;
    borderStyle?: string;
    animationStyle?: 'joyrush' | 'k95' | 'juliencalot' | 'depoluxe' | 'monolog' | 'hildenkaira' | 'radian' | 'avantgarde' | 'cyber' | 'metropolitan' | 'default';
    cursorStyle?: 'dot' | 'bubble' | 'invert' | 'crosshair' | 'none' | 'default';
    navbarStyle?: 'capsule' | 'minimal' | 'karolbinkowski' | 'pelizzari' | 'vividmotion' | 'studiomodular' | 'default';
    cardStyle?: 'minimal' | 'editorial' | 'karolbinkowski' | 'pelizzari' | 'russellnumo' | 'vividmotion' | 'glass' | 'gradient' | 'magazine' | 'bento' | 'masonry' | 'flip' | 'magnetic' | 'default';
    heroStyle?: 'karolbinkowski' | 'pelizzari' | 'russellnumo' | 'vividmotion' | 'konnect' | 'loveandrespect' | 'logoipsum' | 'videostreaming' | 'streaming' | 'puremoda' | 'katerio' | 'retro-portfolio' | 'default';
    footerStyle?: 'karolbinkowski' | 'pelizzari' | 'russellnumo' | 'studiomodular' | 'default';
    scrollStyle?: 'vertical' | 'horizontal' | 'none';
    projectsScroll?: 'grid' | 'horizontal' | 'vertical' | 'masonry' | 'bento';
    blogScroll?: 'grid' | 'horizontal' | 'masonry';
  };
}

// ── Font families collected from each reference website (Google-Fonts equivalents) ──
export interface SiteFontGroup {
  site: string;
  fonts: { name: string; stack: string; role: 'heading' | 'body' | 'both' }[];
}

export const SITE_FONTS: SiteFontGroup[] = [
  {
    site: 'drinkjoyrush.com (Joy Rush)',
    fonts: [
      { name: 'Fredoka', stack: 'Fredoka, sans-serif', role: 'heading' },
      { name: 'Sora', stack: 'Sora, sans-serif', role: 'body' },
      { name: 'Baloo 2', stack: 'Baloo 2, sans-serif', role: 'both' },
    ],
  },
  {
    site: 'k95.it (K95 Studio)',
    fonts: [
      { name: 'Space Mono', stack: 'Space Mono, monospace', role: 'both' },
      { name: 'Archivo', stack: 'Archivo, sans-serif', role: 'body' },
    ],
  },
  {
    site: 'juliencalot.com (Julien Calot)',
    fonts: [
      { name: 'Anton', stack: 'Anton, sans-serif', role: 'heading' },
      { name: 'Fraunces', stack: 'Fraunces, serif', role: 'heading' },
      { name: 'Space Grotesk', stack: 'Space Grotesk, sans-serif', role: 'body' },
    ],
  },
  {
    site: 'depoluxe.xyz (Depo Luxe)',
    fonts: [
      { name: 'Cinzel', stack: 'Cinzel, serif', role: 'heading' },
      { name: 'Cormorant Garamond', stack: 'Cormorant Garamond, serif', role: 'body' },
      { name: 'EB Garamond', stack: 'EB Garamond, serif', role: 'body' },
    ],
  },
  {
    site: 'bymonolog.com (MONOLOG)',
    fonts: [
      { name: 'Instrument Serif', stack: 'Instrument Serif, serif', role: 'heading' },
      { name: 'Cormorant Garamond', stack: 'Cormorant Garamond, serif', role: 'heading' },
      { name: 'Archivo', stack: 'Archivo, sans-serif', role: 'body' },
    ],
  },
  {
    site: 'hildenkaira.fi (Hildén & Kaira)',
    fonts: [
      { name: 'Playfair Display', stack: 'Playfair Display, serif', role: 'heading' },
      { name: 'Outfit', stack: 'Outfit, sans-serif', role: 'body' },
      { name: 'DM Sans', stack: 'DM Sans, sans-serif', role: 'body' },
    ],
  },
  {
    site: 'rideradian.com (Radian)',
    fonts: [
      { name: 'Anton', stack: 'Anton, sans-serif', role: 'heading' },
      { name: 'Plus Jakarta Sans', stack: 'Plus Jakarta Sans, sans-serif', role: 'body' },
      { name: 'JetBrains Mono', stack: 'JetBrains Mono, monospace', role: 'body' },
    ],
  },
  {
    site: 'Awwwards extras',
    fonts: [
      { name: 'Syne', stack: 'Syne, sans-serif', role: 'heading' },
      { name: 'Unbounded', stack: 'Unbounded, sans-serif', role: 'heading' },
      { name: 'JetBrains Mono', stack: 'JetBrains Mono, monospace', role: 'body' },
      { name: 'Playfair Display', stack: 'Playfair Display, serif', role: 'heading' },
      { name: 'Inter', stack: 'Inter, sans-serif', role: 'body' },
      { name: 'Space Grotesk', stack: 'Space Grotesk, sans-serif', role: 'both' },
    ],
  },
];

// ── Effect styles (site-wide animation packages), labeled by source website ──
export const EFFECT_STYLES: { value: NonNullable<ThemeState['layout']['animationStyle']>; label: string }[] = [
  { value: 'default', label: 'None — clean (no site effects)' },
  { value: 'joyrush', label: 'Joy Rush — top marquee, lowercase, sticker buttons (drinkjoyrush.com)' },
  { value: 'k95', label: 'K95 — letter-roll nav hover, uppercase grid (k95.it)' },
  { value: 'juliencalot', label: 'Calot — 000% preloader, film grain (juliencalot.com)' },
  { value: 'depoluxe', label: 'Depo Luxe — roman-numeral index, cinematic (depoluxe.xyz)' },
  { value: 'monolog', label: 'Monolog — word rotator, giant footer brand (bymonolog.com)' },
  { value: 'hildenkaira', label: 'Hildén & Kaira — letter-stagger headline (hildenkaira.fi)' },
  { value: 'radian', label: 'Radian — chapter scroll nav 01/06 (rideradian.com)' },
  { value: 'avantgarde', label: 'Avant-Garde — overlap & outline type' },
  { value: 'cyber', label: 'Retro Cyber — scanlines & glitch' },
  { value: 'metropolitan', label: 'Metropolitan Luxe — slow gold fades' },
];

export const CURSOR_STYLES: { value: NonNullable<ThemeState['layout']['cursorStyle']>; label: string }[] = [
  { value: 'default', label: 'System default' },
  { value: 'dot', label: 'Dot — k95.it / rideradian.com' },
  { value: 'bubble', label: 'Bubble ring — drinkjoyrush.com' },
  { value: 'invert', label: 'Invert blend — juliencalot.com' },
  { value: 'crosshair', label: 'Crosshair — depoluxe.xyz' },
  { value: 'none', label: 'Hidden' },
];

export const presets: Record<string, ThemeState> = {
  Default: {
    colors: {
      primary: '#2563EB',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#09090B',
      muted: '#71717A',
      border: '#E4E4E7',
    },
    typography: {
      fontFamily: 'Space Grotesk, sans-serif',
      headingFont: 'Space Grotesk, sans-serif',
      bodySize: '16px',
      headingSize: '48px',
      bodyWeight: '400',
      headingWeight: '700',
    },
    layout: {
      radius: '1rem',
      animationStyle: 'default',
      cursorStyle: 'default',
      navbarStyle: 'default',
      cardStyle: 'default',
      heroStyle: 'default',
      footerStyle: 'default',
      scrollStyle: 'horizontal',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
    }
  },
  'Love & Respect (loveandrespect.com)': {
    colors: {
      primary: '#D63E2E',
      background: '#F7F5F2',
      surface: '#FFFFFF',
      text: '#2C2B29',
      muted: '#7A7875',
      border: '#E5E2DC',
    },
    typography: {
      fontFamily: 'Outfit, sans-serif',
      headingFont: 'Playfair Display, serif',
      bodySize: '16px',
      headingSize: '64px',
      bodyWeight: '400',
      headingWeight: '300',
    },
    layout: {
      radius: '1.25rem',
      navbarStyle: 'capsule',
      heroStyle: 'loveandrespect',
      cardStyle: 'editorial',
      footerStyle: 'pelizzari',
      animationStyle: 'default',
      cursorStyle: 'default',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
      scrollStyle: 'horizontal',
    }
  },
  'Joy Rush (drinkjoyrush.com)': {
    colors: {
      primary: '#FF5C8A',
      background: '#FFF3F6',
      surface: '#FFE6EC',
      text: '#2C0E1E',
      muted: '#8A6878',
      border: '#FFA3B1',
      accent: '#38BDF8',
    },
    typography: {
      fontFamily: 'Sora, sans-serif',
      headingFont: 'Fredoka, sans-serif',
      bodySize: '16px',
      headingSize: '54px',
      bodyWeight: '400',
      headingWeight: '700',
    },
    layout: {
      radius: '2rem',
      borderStyle: '3px solid #2C0E1E',
      animationStyle: 'joyrush',
      cursorStyle: 'bubble',
      navbarStyle: 'capsule',
      heroStyle: 'default',
      cardStyle: 'gradient',
      footerStyle: 'default',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
      scrollStyle: 'horizontal',
    }
  },
  'K95 Minimal (k95.it)': {
    colors: {
      primary: '#0D0D0D',
      background: '#F4F4F4',
      surface: '#FFFFFF',
      text: '#0F0F0F',
      muted: '#7A7A7A',
      border: '#1A1A1A',
    },
    typography: {
      fontFamily: 'Space Mono, monospace',
      headingFont: 'Space Mono, monospace',
      bodySize: '14px',
      headingSize: '42px',
      bodyWeight: '400',
      headingWeight: '700',
    },
    layout: {
      radius: '0px',
      borderStyle: '1px solid #1A1A1A',
      animationStyle: 'k95',
      cursorStyle: 'dot',
      navbarStyle: 'minimal',
      heroStyle: 'russellnumo',
      cardStyle: 'minimal',
      footerStyle: 'default',
      projectsScroll: 'grid',
      blogScroll: 'grid',
      scrollStyle: 'horizontal',
    }
  },
  'Julien Calot Art (juliencalot.com)': {
    colors: {
      primary: '#FF2A54',
      background: '#0B0A0F',
      surface: '#15131C',
      text: '#FAF9FC',
      muted: '#A59EB5',
      border: '#3F394C',
    },
    typography: {
      fontFamily: 'Space Grotesk, sans-serif',
      headingFont: 'Fraunces, serif',
      bodySize: '16px',
      headingSize: '60px',
      bodyWeight: '400',
      headingWeight: '600',
    },
    layout: {
      radius: '1.25rem',
      animationStyle: 'juliencalot',
      cursorStyle: 'invert',
      navbarStyle: 'capsule',
      heroStyle: 'vividmotion',
      cardStyle: 'glass',
      footerStyle: 'default',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
      scrollStyle: 'horizontal',
    }
  },
  'Depoluxe (depoluxe.xyz)': {
    colors: {
      primary: '#D4AF37',
      background: '#0E0F11',
      surface: '#181A1F',
      text: '#EAEAEA',
      muted: '#808590',
      border: '#2C2F36',
    },
    typography: {
      fontFamily: 'Cinzel, serif',
      headingFont: 'Cinzel, serif',
      bodySize: '15px',
      headingSize: '48px',
      bodyWeight: '400',
      headingWeight: '800',
    },
    layout: {
      radius: '0px',
      borderStyle: '1px solid #2C2F36',
      animationStyle: 'depoluxe',
      cursorStyle: 'crosshair',
      navbarStyle: 'minimal',
      heroStyle: 'pelizzari',
      cardStyle: 'editorial',
      footerStyle: 'pelizzari',
      projectsScroll: 'grid',
      blogScroll: 'grid',
      scrollStyle: 'horizontal',
    }
  },
  'Monolog Editorial (bymonolog.com)': {
    colors: {
      primary: '#4D4137',
      background: '#FAF6F0',
      surface: '#FDFBF7',
      text: '#221D1A',
      muted: '#7C7067',
      border: '#E8E1D7',
    },
    typography: {
      fontFamily: 'Instrument Serif, serif',
      headingFont: 'Cormorant Garamond, serif',
      bodySize: '17px',
      headingSize: '56px',
      bodyWeight: '400',
      headingWeight: '300',
    },
    layout: {
      radius: '0.75rem',
      animationStyle: 'monolog',
      cursorStyle: 'default',
      navbarStyle: 'minimal',
      heroStyle: 'loveandrespect',
      cardStyle: 'magazine',
      footerStyle: 'default',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
      scrollStyle: 'horizontal',
    }
  },
  'Hilden Kaira (hildenkaira.fi)': {
    colors: {
      primary: '#2B4A3F',
      background: '#F9F8F6',
      surface: '#EFEFEA',
      text: '#1C2924',
      muted: '#63726B',
      border: '#D8D8CF',
    },
    typography: {
      fontFamily: 'Outfit, sans-serif',
      headingFont: 'Outfit, sans-serif',
      bodySize: '16px',
      headingSize: '46px',
      bodyWeight: '300',
      headingWeight: '600',
    },
    layout: {
      radius: '0.5rem',
      borderStyle: '1px solid #D8D8CF',
      animationStyle: 'hildenkaira',
      cursorStyle: 'dot',
      navbarStyle: 'default',
      heroStyle: 'loveandrespect',
      cardStyle: 'editorial',
      footerStyle: 'default',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
      scrollStyle: 'horizontal',
    }
  },
  'Radian (rideradian.com)': {
    colors: {
      primary: '#CCFF00',
      background: '#050505',
      surface: '#111111',
      text: '#FFFFFF',
      muted: '#888888',
      border: '#222222',
      accent: '#CCFF00',
    },
    typography: {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      headingFont: 'Anton, sans-serif',
      bodySize: '15px',
      headingSize: '72px',
      bodyWeight: '500',
      headingWeight: '900',
    },
    layout: {
      radius: '4px',
      borderStyle: '2px solid #222222',
      animationStyle: 'radian',
      cursorStyle: 'dot',
      navbarStyle: 'minimal',
      heroStyle: 'karolbinkowski',
      cardStyle: 'karolbinkowski',
      footerStyle: 'karolbinkowski',
      projectsScroll: 'grid',
      blogScroll: 'grid',
      scrollStyle: 'horizontal',
    }
  },
  'Avant-Garde (Awwwards)': {
    colors: {
      primary: '#8B5CF6',
      background: '#0B0914',
      surface: '#161224',
      text: '#F5F3FF',
      muted: '#A78BFA',
      border: '#342A5C',
    },
    typography: {
      fontFamily: 'Syne, sans-serif',
      headingFont: 'Syne, sans-serif',
      bodySize: '16px',
      headingSize: '64px',
      bodyWeight: '400',
      headingWeight: '800',
    },
    layout: {
      radius: '1.5rem',
      animationStyle: 'avantgarde',
      cursorStyle: 'invert',
      navbarStyle: 'capsule',
      heroStyle: 'karolbinkowski',
      cardStyle: 'bento',
      footerStyle: 'karolbinkowski',
      projectsScroll: 'grid',
      blogScroll: 'grid',
      scrollStyle: 'horizontal',
    }
  },
  'Retro Cyber (Awwwards)': {
    colors: {
      primary: '#00FF66',
      background: '#080C0A',
      surface: '#0F1813',
      text: '#E0FFE8',
      muted: '#52A36B',
      border: '#153321',
    },
    typography: {
      fontFamily: 'JetBrains Mono, monospace',
      headingFont: 'Unbounded, sans-serif',
      bodySize: '14px',
      headingSize: '40px',
      bodyWeight: '450',
      headingWeight: '800',
    },
    layout: {
      radius: '0px',
      borderStyle: '1px solid #153321',
      animationStyle: 'cyber',
      cursorStyle: 'crosshair',
      navbarStyle: 'minimal',
      heroStyle: 'russellnumo',
      cardStyle: 'russellnumo',
      footerStyle: 'russellnumo',
      projectsScroll: 'grid',
      blogScroll: 'grid',
      scrollStyle: 'horizontal',
    }
  },
  'Metropolitan Luxe (Awwwards)': {
    colors: {
      primary: '#AF956B',
      background: '#0A0C10',
      surface: '#12161E',
      text: '#F1ECE4',
      muted: '#929B9C',
      border: '#282E3B',
    },
    typography: {
      fontFamily: 'Cinzel, serif',
      headingFont: 'Playfair Display, serif',
      bodySize: '15px',
      headingSize: '50px',
      bodyWeight: '300',
      headingWeight: '700',
    },
    layout: {
      radius: '8px',
      animationStyle: 'metropolitan',
      cursorStyle: 'invert',
      navbarStyle: 'pelizzari',
      heroStyle: 'pelizzari',
      cardStyle: 'pelizzari',
      footerStyle: 'pelizzari',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
      scrollStyle: 'horizontal',
    }
  },
  'Pelizzari Studio (pelizzari.com)': {
    colors: {
      primary: '#D63E2E',
      background: '#F7F5F0',
      surface: '#FFFFFF',
      text: '#1C1C1A',
      muted: '#8A8A85',
      border: '#E8E5DF',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingFont: 'Playfair Display, serif',
      bodySize: '16px',
      headingSize: '72px',
      bodyWeight: '400',
      headingWeight: '400',
    },
    layout: {
      radius: '0px',
      animationStyle: 'default',
      cursorStyle: 'dot',
      navbarStyle: 'pelizzari',
      heroStyle: 'pelizzari',
      cardStyle: 'pelizzari',
      footerStyle: 'pelizzari',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
      scrollStyle: 'horizontal',
    }
  },
  'Karol Binkowski (karolbinkow.ski)': {
    colors: {
      primary: '#E0FD60',
      background: '#0F0F0F',
      surface: '#1A1A1A',
      text: '#FFFFFF',
      muted: '#999999',
      border: '#333333',
    },
    typography: {
      fontFamily: 'Outfit, sans-serif',
      headingFont: 'Outfit, sans-serif',
      bodySize: '16px',
      headingSize: '84px',
      bodyWeight: '400',
      headingWeight: '800',
    },
    layout: {
      radius: '16px',
      animationStyle: 'k95',
      cursorStyle: 'invert',
      navbarStyle: 'karolbinkowski',
      heroStyle: 'karolbinkowski',
      cardStyle: 'karolbinkowski',
      footerStyle: 'karolbinkowski',
      projectsScroll: 'grid',
      blogScroll: 'grid',
      scrollStyle: 'horizontal',
    }
  },
  'Russell Numo (russellnumo.nl)': {
    colors: {
      primary: '#000000',
      background: '#EEEEEE',
      surface: '#FFFFFF',
      text: '#000000',
      muted: '#666666',
      border: '#CCCCCC',
    },
    typography: {
      fontFamily: 'Space Grotesk, sans-serif',
      headingFont: 'Space Grotesk, sans-serif',
      bodySize: '16px',
      headingSize: '64px',
      bodyWeight: '400',
      headingWeight: '700',
    },
    layout: {
      radius: '0px',
      animationStyle: 'default',
      cursorStyle: 'dot',
      navbarStyle: 'minimal',
      heroStyle: 'russellnumo',
      cardStyle: 'russellnumo',
      footerStyle: 'russellnumo',
      projectsScroll: 'grid',
      blogScroll: 'grid',
      scrollStyle: 'horizontal',
    }
  },
  'Konnect Dark (konnect.com)': {
    colors: {
      primary: '#6366F1',
      background: '#0A0B10',
      surface: '#121420',
      text: '#FFFFFF',
      muted: '#818898',
      border: '#23263B',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingFont: 'Outfit, sans-serif',
      bodySize: '16px',
      headingSize: '64px',
      bodyWeight: '400',
      headingWeight: '700',
    },
    layout: {
      radius: '1.5rem',
      navbarStyle: 'capsule',
      heroStyle: 'konnect',
      cardStyle: 'glass',
      footerStyle: 'default',
      animationStyle: 'metropolitan',
      cursorStyle: 'dot',
      projectsScroll: 'horizontal',
      blogScroll: 'horizontal',
      scrollStyle: 'horizontal',
    }
  },
  'Pure Moda Bento (puremoda.com)': {
    colors: {
      primary: '#111111',
      background: '#F6F6F4',
      surface: '#FFFFFF',
      text: '#111111',
      muted: '#767676',
      border: '#E2E2DE',
    },
    typography: {
      fontFamily: 'Space Grotesk, sans-serif',
      headingFont: 'Space Grotesk, sans-serif',
      bodySize: '15px',
      headingSize: '56px',
      bodyWeight: '400',
      headingWeight: '700',
    },
    layout: {
      radius: '1.25rem',
      navbarStyle: 'minimal',
      heroStyle: 'puremoda',
      cardStyle: 'bento',
      footerStyle: 'default',
      animationStyle: 'default',
      cursorStyle: 'default',
      projectsScroll: 'grid',
      blogScroll: 'grid',
      scrollStyle: 'horizontal',
    }
  }
};
