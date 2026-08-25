// ─── Global TypeScript Type Definitions ─────────────────────────────────────

export interface PersonalInfo {
  name: string;
  title: string;
  summary: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  website: string;
  location: string;
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  period: string;
}

export interface Project {
  id?: string;
  _id?: string;
  title: string;
  subtitle?: string;
  category?: string;
  problem?: string;
  data?: string;
  dataset_url?: string;
  records_count?: string;
  process?: string;
  insight?: string;
  result?: string;
  tags: string[];
  githubLink?: string;
  github_link?: string;
  liveLink?: string;
  live_link?: string;
  demoLink?: string;
  imageUrl?: string;
  image_url?: string;
  chartType?: number;
  published?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  bullets?: string[];
  stack?: string[];
}

export interface Experience {
  id?: string;
  title?: string;
  role: string;
  company: string;
  location?: string;
  period: string;
  type?: string;
  impact?: string;
  media_url?: string;
  company_website?: string;
  published?: boolean;
  sort_order?: number;
  created_at?: string;
  bullets?: string[];
}

export interface Blog {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  readTime?: string;
  read_time?: string;
  coverImage?: string;
  cover_image?: string;
  authorName?: string;
  author_name?: string;
  authorAvatar?: string;
  author_avatar?: string;
  published?: boolean;
  featured?: boolean;
  sort_order?: number;
  publishedAt?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Certification {
  title?: string;
  name?: string;
  issuer?: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  projects: Project[];
  experience: Experience[];
  skills: Record<string, string[]>;
  certifications: Certification[];
}

// ── Theme State Types ───────────────────────────────────────────────────────

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent?: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFont: string;
  bodySize: string;
  headingSize: string;
  bodyWeight: string;
  headingWeight: string;
}

export interface ThemeLayout {
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
}

export interface ThemeState {
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
}

// ── Visual Editor & Canvas Types ────────────────────────────────────────────

export type EditKind = 'text' | 'heading' | 'button' | 'link' | 'image' | 'container' | 'section' | 'card' | 'navbar' | 'footer';

export type DeviceMode = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'custom';

export interface Crumb {
  id: string;
  name: string;
}

export interface SelectedInfo {
  id: string;
  name: string;
  kind: EditKind;
  path?: string;
  text?: string;
  breadcrumb: Crumb[];
  computed: Record<string, string>;
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export type StyleMap = Record<string, string>;
export type OverrideMap = Record<string, StyleMap>;
export type ContentDraft = Record<string, any>;

export interface CustomElement {
  id: string;
  section: string;
  kind: EditKind;
  name: string;
  value: string;
  href?: string;
  path: string;
  order: number;
}
