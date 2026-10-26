/**
 * Spring Boot REST API Client for blog.arunpandian.online
 * Handles JWT token injection, environment URL resolution, and unified error handling.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiError {
  status: number;
  error: string;
  message: string;
  validationErrors?: Record<string, string>;
}

export class ApiException extends Error {
  status: number;
  validationErrors?: Record<string, string>;

  constructor(status: number, message: string, validationErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

import { supabase } from '../lib/supabaseClient';

function getAuthHeader(endpoint: string): Record<string, string> {
  // Public auth endpoints must never carry an Authorization header
  if (
    endpoint === '/api/auth/login' ||
    endpoint === '/api/auth/register' ||
    endpoint === '/api/auth/forgot-password' ||
    endpoint === '/api/auth/reset-password'
  ) {
    return {};
  }

  const token = localStorage.getItem('arun_admin_jwt');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(endpoint),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMsg = (isJson && (data.message || data.error)) || response.statusText || 'Request failed';
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      errorMsg = 'Service is starting up or temporarily offline. Connecting via Supabase cloud...';
    }
    const validationErrors = isJson ? data.validationErrors : undefined;
    throw new ApiException(response.status, errorMsg, validationErrors);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    async login(emailOrUsername: string, password: string) {
      const input = (emailOrUsername || '').trim();
      let resolvedEmail = input;

      // 1. If Supabase is configured:
      if (supabase) {
        try {
          // If input is a username (e.g. "arunpandian" or "@arunpandian"), lookup corresponding email from users table
          if (!input.includes('@') || input.startsWith('@')) {
            const cleanHandle = input.replace(/^@/, '').toLowerCase();
            const { data: userLookup } = await supabase
              .from('users')
              .select('email')
              .eq('username', cleanHandle)
              .maybeSingle();

            if (userLookup?.email) {
              resolvedEmail = userLookup.email;
            }
          }

          // Try Supabase Auth
          if (resolvedEmail.includes('@')) {
            const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
              email: resolvedEmail,
              password,
            });

            if (!supaError && supaData?.session?.access_token) {
              const token = supaData.session.access_token;
              localStorage.setItem('arun_admin_jwt', token);

              // Fetch enriched profile from public.users table or backend
              let userProfile: any = null;
              try {
                const { data: dbUser } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', resolvedEmail.toLowerCase())
                  .maybeSingle();

                if (dbUser) {
                  userProfile = {
                    id: dbUser.id,
                    email: dbUser.email,
                    fullName: dbUser.full_name || supaData.user?.user_metadata?.full_name || 'User',
                    username: dbUser.username || supaData.user?.user_metadata?.username || resolvedEmail.split('@')[0],
                    role: dbUser.role || supaData.user?.user_metadata?.role || 'ROLE_USER',
                    bio: dbUser.bio,
                    avatarUrl: dbUser.avatar_url,
                  };
                }
              } catch {}

              if (!userProfile) {
                userProfile = {
                  id: supaData.user?.id,
                  email: supaData.user?.email || resolvedEmail,
                  fullName: supaData.user?.user_metadata?.full_name || 'User',
                  username: supaData.user?.user_metadata?.username || resolvedEmail.split('@')[0],
                  role: supaData.user?.user_metadata?.role || 'ROLE_USER',
                };
              }

              localStorage.setItem('arun_admin_user', JSON.stringify(userProfile));

              // Optional background sync with backend
              try {
                request('/api/auth/me').catch(() => {});
              } catch {}

              return { token, user: userProfile };
            }
          }
        } catch (supaErr) {
          console.warn('Supabase auth attempt note:', supaErr);
        }
      }

      // 2. Call backend login (supports local Spring Boot credentials)
      try {
        const res = await request<{ token: string; user: any }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: input, password }),
        });

        if (res.token) {
          localStorage.setItem('arun_admin_jwt', res.token);
          localStorage.setItem('arun_admin_user', JSON.stringify(res.user));
        }

        // If Supabase is available, sync session in Supabase client
        if (supabase && resolvedEmail.includes('@')) {
          try {
            await supabase.auth.signInWithPassword({ email: resolvedEmail, password });
          } catch {}
        }

        return res;
      } catch (backendErr: any) {
        // If 502/network failure and user typed admin demo credentials, offer friendly message
        if (backendErr.status === 502) {
          throw new ApiException(
            502,
            'Unable to reach local backend server. Please verify backend is running on port 8080 or use your registered email.'
          );
        }
        throw backendErr;
      }
    },

    async register(data: { email: string; username: string; password: string; fullName: string }) {
      const email = data.email.trim().toLowerCase();
      const username = data.username.trim().toLowerCase().replace(/^@/, '');
      const fullName = data.fullName.trim();

      // 1. If Supabase is configured, register directly with Supabase GoTrue Auth
      if (supabase) {
        try {
          const { data: supaData, error: supaError } = await supabase.auth.signUp({
            email,
            password: data.password,
            options: {
              data: {
                full_name: fullName,
                username,
                role: 'ROLE_USER',
              },
            },
          });

          if (!supaError && supaData?.user) {
            // Upsert in public.users table
            try {
              await supabase.from('users').upsert(
                {
                  id: supaData.user.id,
                  supabase_uid: supaData.user.id,
                  email,
                  username,
                  full_name: fullName,
                  role: 'ROLE_USER',
                },
                { onConflict: 'email' }
              );
            } catch (upsertErr) {
              console.warn('User table upsert note:', upsertErr);
            }

            const userObj = {
              id: supaData.user.id,
              email,
              username,
              fullName,
              role: 'ROLE_USER',
            };

            const token = supaData.session?.access_token || 'token_' + supaData.user.id;
            localStorage.setItem('arun_admin_jwt', token);
            localStorage.setItem('arun_admin_user', JSON.stringify(userObj));

            // Sync with backend in background if available
            try {
              request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
              }).catch(() => {});
            } catch {}

            return { token, user: userObj };
          } else if (supaError) {
            console.warn('Supabase sign-up message:', supaError.message);
          }
        } catch (supaErr) {
          console.warn('Supabase sign-up attempt error:', supaErr);
        }
      }

      // 2. Call backend register
      const res = await request<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (res?.token) {
        localStorage.setItem('arun_admin_jwt', res.token);
        localStorage.setItem('arun_admin_user', JSON.stringify(res.user));
      }

      return res;
    },

    async restoreSession() {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            localStorage.setItem('arun_admin_jwt', session.access_token);
            // Fetch profile from supabase or backend
            try {
              const { data: dbUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .maybeSingle();

              if (dbUser) {
                const profile = {
                  id: dbUser.id,
                  email: dbUser.email,
                  fullName: dbUser.full_name || session.user.user_metadata?.full_name || 'User',
                  username: dbUser.username || session.user.user_metadata?.username || session.user.email?.split('@')[0],
                  role: dbUser.role || session.user.user_metadata?.role || 'ROLE_USER',
                  bio: dbUser.bio,
                  avatarUrl: dbUser.avatar_url,
                };
                localStorage.setItem('arun_admin_user', JSON.stringify(profile));
                return profile;
              }
            } catch {}

            const fallbackProfile = {
              id: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata?.full_name || 'User',
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
              role: session.user.user_metadata?.role || 'ROLE_USER',
            };
            localStorage.setItem('arun_admin_user', JSON.stringify(fallbackProfile));
            return fallbackProfile;
          }
        } catch {
          // Keep existing local storage session if Supabase check fails
        }
      }

      // Fallback check existing token in localStorage
      const token = localStorage.getItem('arun_admin_jwt');
      if (token) {
        try {
          const user = await request<any>('/api/auth/me');
          if (user) {
            localStorage.setItem('arun_admin_user', JSON.stringify(user));
            return user;
          }
        } catch {
          // Token is expired or invalid
          localStorage.removeItem('arun_admin_jwt');
          localStorage.removeItem('arun_admin_user');
        }
      }
      return null;
    },

    async resetPassword(email: string) {
      if (supabase) {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (!error) return { message: 'Password reset link sent to your email.' };
        } catch {}
      }
      return { message: 'If an account exists with that email, a reset link will be sent.' };
    },

    async me() {
      return request<any>('/api/auth/me');
    },

    logout() {
      localStorage.removeItem('arun_admin_jwt');
      localStorage.removeItem('arun_admin_user');
      if (supabase) {
        try {
          supabase.auth.signOut().catch(() => {});
        } catch {}
      }
      try {
        request<any>('/api/auth/logout', { method: 'POST' }).catch(() => {});
      } catch {}
    },

    getToken() {
      return localStorage.getItem('arun_admin_jwt');
    },

    getUser() {
      try {
        return JSON.parse(localStorage.getItem('arun_admin_user') || 'null');
      } catch {
        return null;
      }
    },

    isAuthenticated() {
      return !!localStorage.getItem('arun_admin_jwt');
    },
  },

  // User profiles & settings
  users: {
    async getPublicProfile(username: string) {
      return request<any>(`/api/users/${encodeURIComponent(username)}`);
    },
    async updateProfile(data: {
      fullName: string;
      bio?: string;
      avatarUrl?: string;
      website?: string;
      github?: string;
      twitter?: string;
    }) {
      const res = await request<any>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      localStorage.setItem('arun_admin_user', JSON.stringify(res));
      return res;
    },
    async updatePassword(data: { currentPassword: string; newPassword: string }) {
      return request<{ message: string }>('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Bookmarks
  bookmarks: {
    async getBookmarks() {
      return request<any[]>('/api/bookmarks');
    },
    async toggle(blogId: string) {
      return request<{ blogId: string; bookmarked: boolean }>(`/api/bookmarks/${blogId}`, {
        method: 'POST',
      });
    },
    async remove(blogId: string) {
      return request<void>(`/api/bookmarks/${blogId}`, { method: 'DELETE' });
    },
    async isBookmarked(blogId: string) {
      return request<{ bookmarked: boolean }>(`/api/bookmarks/${blogId}/status`);
    },
  },

  // Blogs
  blogs: {
    async getPublicBlogs(
      paramsOrQuery: any = {},
      pageArg?: number,
      sizeArg?: number
    ) {
      const opts =
        typeof paramsOrQuery === 'string'
          ? { query: paramsOrQuery, page: pageArg ?? 0, size: sizeArg ?? 20 }
          : paramsOrQuery || {};

      const searchParams = new URLSearchParams({
        page: String(opts.page || 0),
        size: String(opts.size || 20),
      });
      if (opts.query) searchParams.append('query', opts.query);
      if (opts.category && opts.category !== 'All') searchParams.append('category', opts.category);
      if (opts.tag) searchParams.append('tag', opts.tag);
      if (opts.author) searchParams.append('author', opts.author);

      try {
        return await request<{ content: any[]; totalElements: number; totalPages: number }>(
          `/api/blogs?${searchParams.toString()}`
        );
      } catch (err) {
        // Fallback to Supabase
        if (supabase) {
          try {
            let query = supabase
              .from('blogs')
              .select('*', { count: 'exact' })
              .eq('published', true)
              .order('sort_order', { ascending: true });

            if (opts.category && opts.category !== 'All') {
              query = query.eq('category', opts.category);
            }
            if (opts.query) {
              query = query.or(`title.ilike.%${opts.query}%,excerpt.ilike.%${opts.query}%`);
            }

            const from = (opts.page || 0) * (opts.size || 20);
            const to = from + (opts.size || 20) - 1;
            const { data, count, error } = await query.range(from, to);

            if (!error && data) {
              return {
                content: data,
                totalElements: count || data.length,
                totalPages: Math.ceil((count || data.length) / (opts.size || 20)),
              };
            }
          } catch {}
        }
        throw err;
      }
    },

    async getBlogBySlug(slug: string) {
      try {
        return await request<any>(`/api/blogs/${encodeURIComponent(slug)}`);
      } catch (err) {
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('blogs')
              .select('*')
              .eq('slug', slug)
              .single();
            if (!error && data) return data;
          } catch {}
        }
        throw err;
      }
    },
    async getRelatedBlogs(slug: string) {
      return request<any[]>(`/api/blogs/${encodeURIComponent(slug)}/related`);
    },
    async getMyArticles(page = 0, size = 20) {
      return request<{ content: any[]; totalElements: number; totalPages: number }>(`/api/blogs/me?page=${page}&size=${size}`);
    },
    async clapBlog(id: string) {
      return request<{ clapsCount: number }>(`/api/blogs/${id}/clap`, { method: 'POST' });
    },
    async getAllBlogsAdmin(query = '', status = '', page = 0, size = 20) {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (query) params.append('query', query);
      if (status) params.append('status', status);
      return request<{ content: any[]; totalElements: number; totalPages: number }>(`/api/admin/blogs?${params.toString()}`);
    },
    async getBlogAdmin(id: string) {
      return request<any>(`/api/admin/blogs/${id}`);
    },
    async createBlog(data: any) {
      return request<any>('/api/blogs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async updateBlog(id: string, data: any) {
      return request<any>(`/api/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async deleteBlog(id: string) {
      return request<void>(`/api/blogs/${id}`, { method: 'DELETE' });
    },
  },

  // Comments
  comments: {
    async getComments(targetSlug?: string, blogId?: string) {
      const params = new URLSearchParams();
      if (targetSlug) params.append('targetSlug', targetSlug);
      if (blogId) params.append('blogId', blogId);
      return request<any[]>(`/api/comments?${params.toString()}`);
    },
    async createComment(data: {
      targetSlug?: string;
      blogId?: string;
      authorName: string;
      authorEmail?: string;
      authorDomain?: string;
      content: string;
    }) {
      return request<any>('/api/comments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async likeComment(id: string) {
      return request<{ likes: number }>(`/api/comments/${id}/like`, { method: 'POST' });
    },
    async getAllAdmin(status?: string, page = 0, size = 20) {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.append('status', status);
      return request<{ content: any[]; totalElements: number }>(`/api/admin/comments?${params.toString()}`);
    },
    async updateStatus(id: string, status: string) {
      return request<any>(`/api/admin/comments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    async deleteComment(id: string) {
      return request<void>(`/api/admin/comments/${id}`, { method: 'DELETE' });
    },
  },

  // Reactions
  reactions: {
    async addReaction(data: { targetType: string; targetId: string; reactionType: string; sessionId?: string }) {
      return request<any>('/api/reactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async getSummary(targetType: string, targetId: string) {
      return request<Record<string, number>>(`/api/reactions/summary?targetType=${targetType}&targetId=${targetId}`);
    },
  },

  // Newsletter
  newsletter: {
    async subscribe(email: string, source = 'web') {
      return request<{ message: string }>('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, source }),
      });
    },
    async unsubscribe(email: string) {
      return request<{ message: string }>('/api/newsletter/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    async getSubscribersAdmin(page = 0, size = 50) {
      return request<any>(`/api/admin/newsletter/subscribers?page=${page}&size=${size}`);
    },
    async broadcast(subject: string, content: string) {
      return request<any>('/api/admin/newsletter/broadcast', {
        method: 'POST',
        body: JSON.stringify({ subject, content }),
      });
    },
  },

  // Site Settings
  settings: {
    async getAll() {
      return request<Record<string, string>>('/api/settings');
    },
    async get(key: string) {
      return request<{ key: string; value: string }>(`/api/settings/${key}`);
    },
    async update(key: string, value: string) {
      return request<any>(`/api/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
    },
  },

  // Community (Following & Reports)
  community: {
    async toggleFollow(userId: string) {
      return request<{ following: boolean; followersCount: number }>(`/api/community/follow/${userId}`, {
        method: 'POST',
      });
    },
    async getFollowStatus(userId: string) {
      return request<{ following: boolean; followersCount: number }>(`/api/community/follow-status/${userId}`);
    },
    async submitReport(targetType: 'BLOG' | 'COMMENT', targetId: string, reason: string, details?: string) {
      return request<any>('/api/community/reports', {
        method: 'POST',
        body: JSON.stringify({ targetType, targetId, reason, details: details || '' }),
      });
    },
    async getReports(status = 'PENDING', page = 0, size = 20) {
      return request<any>(`/api/community/admin/reports?status=${status}&page=${page}&size=${size}`);
    },
    async updateReportStatus(reportId: string, status: string) {
      return request<any>(`/api/community/admin/reports/${reportId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },
};
