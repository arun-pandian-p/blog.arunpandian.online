export interface User {
  id: string;
  supabase_uid?: string;
  email: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  github?: string;
  twitter?: string;
  role: string;
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  content_json?: any;
  tags?: string[] | string;
  read_time?: string | number;
  cover_image?: string;
  cover_video_url?: string;
  author_id?: string;
  author_username?: string;
  author_name?: string;
  author_avatar?: string;
  author_bio?: string;
  category?: string;
  published: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  views_count: number;
  claps_count: number;
  published_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  blog_id: string;
  target_slug?: string;
  author_id?: string;
  author_name: string;
  author_email?: string;
  author_avatar?: string;
  content: string;
  status: string;
  likes: number;
  parent_id?: string;
  created_at: string;
  replies?: Comment[];
}

export interface Bookmark {
  id: string;
  user_id: string;
  blog_id: string;
  created_at: string;
  blog?: Blog;
}

export interface AbuseReport {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export interface Stats {
  totalStories: number;
  publishedStories: number;
  draftStories: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
  totalClaps: number;
  pendingReports: number;
}

