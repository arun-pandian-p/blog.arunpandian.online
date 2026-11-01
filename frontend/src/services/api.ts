import { Blog, Comment, Bookmark, User, AbuseReport, Stats } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('apstories_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(emailOrUsername: string, password: string):Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  async register(data: { email: string; username: string; fullName: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Blogs
  async getBlogs(params?: { search?: string; tag?: string; category?: string; sort?: string; page?: number; limit?: number }): Promise<Blog[]> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.tag) q.append('tag', params.tag);
    if (params?.category) q.append('category', params.category);
    if (params?.sort) q.append('sort', params.sort);
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/blogs?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch stories');
    return res.json();
  },

  async getFeaturedBlogs(): Promise<Blog[]> {
    const res = await fetch(`${API_BASE}/blogs/featured`);
    if (!res.ok) return [];
    return res.json();
  },

  async getBlogBySlug(slug: string): Promise<Blog> {
    const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Story not found');
    return res.json();
  },

  async getBlogsByAuthor(username: string, includeDrafts = false): Promise<Blog[]> {
    const res = await fetch(`${API_BASE}/blogs/author/${encodeURIComponent(username)}?includeDrafts=${includeDrafts}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async createBlog(blog: Partial<Blog>): Promise<Blog> {
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blog),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save story');
    }
    return res.json();
  },

  async updateBlog(id: string, blog: Partial<Blog>): Promise<Blog> {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(blog),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update story');
    }
    return res.json();
  },

  async deleteBlog(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete story');
    return true;
  },

  async clapBlog(id: string, amount = 1): Promise<number> {
    const res = await fetch(`${API_BASE}/blogs/${id}/clap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.claps_count;
  },

  async incrementViews(id: string): Promise<void> {
    await fetch(`${API_BASE}/blogs/${id}/views`, { method: 'POST' }).catch(() => {});
  },

  // Comments
  async getComments(blogId: string): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/blogs/${blogId}/comments`);
    if (!res.ok) return [];
    return res.json();
  },

  async addComment(blogId: string, data: { content: string; parent_id?: string; author_name?: string; author_email?: string }): Promise<Comment> {
    const res = await fetch(`${API_BASE}/blogs/${blogId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to post comment');
    return res.json();
  },

  async likeComment(commentId: string): Promise<number> {
    const res = await fetch(`${API_BASE}/comments/${commentId}/like`, { method: 'POST' });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.likes;
  },

  async deleteComment(commentId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  // Bookmarks
  async getBookmarks(): Promise<Bookmark[]> {
    const res = await fetch(`${API_BASE}/bookmarks`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async toggleBookmark(blogId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/bookmarks/${blogId}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.bookmarked;
  },

  async checkBookmark(blogId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/bookmarks/${blogId}/check`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.bookmarked;
  },

  // Media upload
  async uploadMedia(file: File): Promise<{ url: string; filename: string; isSvg: boolean }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('apstories_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload media');
    }
    return res.json();
  },

  // Reports
  async submitReport(data: { target_type: string; target_id: string; reason: string; details?: string }): Promise<AbuseReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<Stats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get admin stats');
    return res.json();
  },

  async getAdminReports(status?: string): Promise<AbuseReport[]> {
    const q = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/admin/reports${q}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async updateReportStatus(reportId: string, status: string): Promise<AbuseReport> {
    const res = await fetch(`${API_BASE}/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },
};

