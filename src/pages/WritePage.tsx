import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { api } from '../services/apiClient';
import TiptapEditor from '../components/editor/TiptapEditor';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editParam = searchParams.get('edit');

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialBlog, setInitialBlog] = useState<any>(null);

  // Authenticate user and optionally load blog if editParam present
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // 1. Check current authenticated user
      let user = null;
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          user = {
            id: session.user.id,
            email: session.user.email,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url || ''
          };
        }
      }

      if (!user) {
        const localUser = localStorage.getItem('arun_admin_user');
        if (localUser) {
          try {
            user = JSON.parse(localUser);
          } catch {}
        }
      }

      if (!user) {
        // Redirect to login with return path
        toast('Please sign in to write an article', { icon: '✍️' });
        navigate('/login?redirect=/write', { replace: true });
        return;
      }

      if (isMounted) setCurrentUser(user);

      // 2. If editing existing blog, fetch it
      if (editParam) {
        try {
          let blogData = null;
          // Try backend first
          try {
            blogData = await api.blogs.getBlogBySlug(editParam);
          } catch {
            // Fallback to Supabase
            if (supabase) {
              const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .or(`id.eq.${editParam},slug.eq.${editParam}`)
                .single();
              if (!error && data) blogData = data;
            }
          }

          if (isMounted && blogData) {
            // Check ownership unless admin
            const isAdmin = user.role === 'ROLE_ADMIN' || user.email === 'arunpandian.p@outlook.com';
            const isOwner = blogData.author_id === user.id || blogData.authorId === user.id || blogData.author_name === user.name;
            if (!isAdmin && !isOwner && blogData.author_id) {
              toast.error('You do not have permission to edit another author\'s story');
              navigate('/', { replace: true });
              return;
            }
            setInitialBlog(blogData);
          }
        } catch (err: any) {
          console.warn('Error loading article for edit:', err);
          toast.error('Could not load the specified story');
        }
      }

      if (isMounted) setLoading(false);
    };

    init();
    return () => { isMounted = false; };
  }, [editParam, navigate]);

  const handleSave = async (blogPayload: any, isPublish: boolean) => {
    try {
      let parsedContentJson = null;
      if (blogPayload.content_json) {
        parsedContentJson = blogPayload.content_json;
      } else if (blogPayload.contentJson) {
        parsedContentJson = typeof blogPayload.contentJson === 'string' 
          ? JSON.parse(blogPayload.contentJson) 
          : blogPayload.contentJson;
      }

      const payload: any = {
        title: blogPayload.title || 'Untitled Story',
        slug: blogPayload.slug || (blogPayload.title || 'story').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        excerpt: blogPayload.excerpt || '',
        content: blogPayload.content || '',
        content_json: parsedContentJson,
        category: blogPayload.category || 'Engineering',
        tags: Array.isArray(blogPayload.tags) 
          ? blogPayload.tags.join(',') 
          : (blogPayload.tags || blogPayload.category || 'Engineering'),
        cover_image: blogPayload.cover_image || '',
        cover_video_url: blogPayload.cover_video_url || '',
        published: Boolean(blogPayload.published || isPublish),
        status: blogPayload.status || (isPublish ? 'PUBLISHED' : 'DRAFT'),
        scheduled_at: blogPayload.scheduled_at || null,
        read_time: blogPayload.read_time || '5 min read',
        author_id: currentUser?.id || undefined,
        author_name: currentUser?.name || currentUser?.username || 'Author',
        author_username: currentUser?.username || 'author',
        author_avatar: currentUser?.avatarUrl || '',
        updated_at: new Date().toISOString()
      };

      let result: any = null;

      if (initialBlog?.id) {
        // Update existing story
        try {
          if (supabase) {
            const { data, error } = await supabase
              .from('blogs')
              .update(payload)
              .eq('id', initialBlog.id)
              .select()
              .single();
            if (!error && data) {
              result = data;
            } else {
              result = await api.blogs.updateBlog(initialBlog.id, payload);
            }
          } else {
            result = await api.blogs.updateBlog(initialBlog.id, payload);
          }
        } catch {
          result = await api.blogs.updateBlog(initialBlog.id, payload);
        }
      } else {
        // Create new story
        payload.created_at = new Date().toISOString();
        let created = false;
        if (supabase) {
          const { data, error } = await supabase
            .from('blogs')
            .insert([payload])
            .select()
            .single();
          if (!error && data) {
            result = data;
            created = true;
          }
        }
        
        if (!created) {
          result = await api.blogs.createBlog(payload);
        }
        setInitialBlog(result);
      }

      if (isPublish && result?.slug) {
        toast.success('Story published successfully! 🎉');
        navigate(`/posts/${result.slug}`);
      } else {
        toast.success('Draft saved! 📝');
      }

      return result;
    } catch (err: any) {
      toast.error('Failed to save story: ' + (err.message || 'Unknown error'));
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#B83A26]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#7A7265]">Loading Writing Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TiptapEditor
        initialBlog={initialBlog}
        onSave={handleSave}
        onBack={() => {
          if (initialBlog?.slug) {
            navigate(`/posts/${initialBlog.slug}`);
          } else {
            navigate(-1);
          }
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
