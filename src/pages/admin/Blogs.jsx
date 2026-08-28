import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, Plus, Edit2, Trash2, Search, Filter, 
  List, Grid, RefreshCw, Download, ExternalLink, Eye, EyeOff,
  FileText, Image as ImageIcon, Video, Code, Table, Link as LinkIcon,
  Sparkles, Globe, Share2, Tag, Calendar, Clock, User, Check,
  BookOpen, AlignLeft, Info, Lightbulb, AlertTriangle, AlertCircle, Play,
  Maximize2, Minimize2, Columns, SplitSquareVertical, Type, Heading1, Heading2,
  Heading3, Heading4, Bold, Italic, Strikethrough, Underline, Highlighter,
  Quote, CheckSquare, ListOrdered, Minus, Database, BarChart3, HelpCircle,
  Upload, Copy, ArrowRight, Layers, FileCode
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUpload from '../../components/admin/ui/ImageUpload';
import { parseArticleMetadata, serializeBlogContent } from '../../utils/blogParser';
import toast from 'react-hot-toast';

export default function Blogs() {
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Latest Published');
  const [viewMode, setViewMode] = useState('grid');

  // Modal & Editor state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('editor'); // 'editor' | 'core' | 'media' | 'seo'
  const [editorViewMode, setEditorViewMode] = useState('split'); // 'split' | 'write' | 'preview'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);

  // Deletion Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  // Inline Image Inserter Modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const [inlineImageCaption, setInlineImageCaption] = useState('');
  const inlineFileInputRef = useRef(null);
  const editorTextareaRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Data Analytics',
    tags: '',
    read_time: '5 min read',
    author_name: 'Arun Pandian',
    author_avatar: 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png',
    published_at: new Date().toISOString().split('T')[0],
    cover_image: '',
    image_caption: '',
    video_url: '',
    powerbi_url: '',
    github_link: 'https://github.com/arun-pandian-p',
    live_link: '',
    seo_title: '',
    seo_description: '',
    social_image: '',
    published: true,
    featured: false,
    sort_order: 0
  });

  useEffect(() => {
    fetchBlogs();

    const channel = supabase
      .channel('blogs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blogs' },
        () => {
          fetchBlogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle ?edit= URL query parameter
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && blogs.length > 0) {
      const target = blogs.find(
        (b) => String(b.id) === String(editId) || String(b.slug) === String(editId)
      );
      if (target) {
        openModal(target);
      }
    }
  }, [searchParams, blogs]);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setBlogs(data);
    setLoading(false);
  };

  const handleDeleteClick = (blog) => {
    setDeleteConfirm({ isOpen: true, id: blog.id, title: blog.title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      toast.success('Blog post deleted successfully');
    } catch (err) {
      toast.error('Error deleting blog post: ' + err.message);
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchBlogs();
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ published: !blog.published })
        .eq('id', blog.id);
      
      if (error) throw error;
      toast.success(`Post ${blog.published ? 'hidden' : 'published'} successfully`);
      fetchBlogs();
    } catch (err) {
      toast.error('Error updating status: ' + err.message);
    }
  };

  const openModal = (blog = null) => {
    setActiveModalTab('editor');
    setEditorViewMode('split');
    setIsFullscreen(false);

    if (blog) {
      setEditingBlog(blog);
      const { cleanContent, meta } = parseArticleMetadata(blog);

      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: cleanContent || '',
        category: meta.category || (Array.isArray(blog.tags) && blog.tags[0]) || 'Data Analytics',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
        read_time: blog.read_time || '5 min read',
        author_name: blog.author_name || 'Arun Pandian',
        author_avatar: blog.author_avatar || 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png',
        published_at: blog.published_at ? blog.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
        cover_image: blog.cover_image || '',
        image_caption: meta.imageCaption || '',
        video_url: meta.videoUrl || '',
        powerbi_url: meta.powerbiUrl || '',
        github_link: meta.githubLink || 'https://github.com/arun-pandian-p',
        live_link: meta.liveLink || '',
        seo_title: meta.seoTitle || blog.title || '',
        seo_description: meta.seoDescription || blog.excerpt || '',
        social_image: meta.socialImage || blog.cover_image || '',
        published: Boolean(blog.published),
        featured: Boolean(blog.featured),
        sort_order: blog.sort_order || 0
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: `## 1. Executive Summary & Objective\n\nStart your data analysis article here...\n\n## 2. Dataset Architecture & Normalization\n\nExplain the dataset schema, data cleaning, and ETL transformation pipeline.\n\n\`\`\`sql\n-- Sample SQL query\nSELECT category, COUNT(*) AS total_orders\nFROM sales_data\nGROUP BY category;\n\`\`\`\n\n## 3. Key Findings & Business Impact\n\n> [!NOTE]\n> Automated anomaly detection identified 18% variance in peak hours.\n\n| Metric | Baseline | Optimized | Lift |\n|---|---|---|---|\n| Avg Lead Time | 24 hrs | 14 hrs | +41% |\n| Conversion Rate | 2.8% | 4.1% | +46% |`,
        category: 'Data Analytics',
        tags: 'Power BI, SQL, Data Analytics, Python',
        read_time: '5 min read',
        author_name: 'Arun Pandian',
        author_avatar: 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png',
        published_at: new Date().toISOString().split('T')[0],
        cover_image: '',
        image_caption: '',
        video_url: '',
        powerbi_url: '',
        github_link: 'https://github.com/arun-pandian-p',
        live_link: '',
        seo_title: '',
        seo_description: '',
        social_image: '',
        published: true,
        featured: false,
        sort_order: blogs.length > 0 ? Math.max(...blogs.map(b => b.sort_order || 0)) + 1 : 1
      });
    }
    setIsModalOpen(true);
  };

  // Helper to insert markdown snippet at cursor or append
  const insertMarkdownSnippet = (snippet) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) {
      setFormData(prev => ({
        ...prev,
        content: prev.content ? `${prev.content}\n\n${snippet}` : snippet
      }));
      toast.success('Element inserted!', { icon: '✨' });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = formData.content;

    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);
    const prefix = (start > 0 && !before.endsWith('\n\n')) ? '\n\n' : '';
    const suffix = (!after.startsWith('\n\n') && after.length > 0) ? '\n\n' : '';
    
    const newContent = `${before}${prefix}${snippet}${suffix}${after}`;
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + snippet.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);

    toast.success('Element inserted!', { icon: '✨' });
  };

  // Direct Inline Image Upload via Device File Picker
  const handleInlineImageFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, GIF)');
      return;
    }

    try {
      setUploadingInlineImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      const cleanCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      insertMarkdownSnippet(`![${cleanCaption}](${publicUrl})`);
      toast.success('Image uploaded and inserted into article!', { icon: '📸' });
    } catch (err) {
      toast.error('Error uploading image: ' + err.message);
    } finally {
      setUploadingInlineImage(false);
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = '';
    }
  };

  const handleInsertUrlImage = (e) => {
    e.preventDefault();
    if (!inlineImageUrl.trim()) return;
    insertMarkdownSnippet(`![${inlineImageCaption.trim() || 'Figure Visual'}](${inlineImageUrl.trim()})`);
    setInlineImageUrl('');
    setInlineImageCaption('');
    setImageModalOpen(false);
  };

  // Starter Templates
  const applyTemplate = (templateType) => {
    if (formData.content.trim().length > 50 && !window.confirm('Replace existing article content with this template?')) {
      return;
    }

    if (templateType === 'case-study') {
      setFormData(prev => ({
        ...prev,
        content: `## 1. Executive Problem Statement\n\nBrief overview of the business challenge, baseline metrics, and stakeholder objectives.\n\n> [!NOTE]\n> Key hypothesis: Enhancing ETL automation and index optimization will yield a 35% throughput increase.\n\n## 2. Dataset Architecture & ETL Pipeline\n\nDescribe the raw schema, normalization techniques, and transformation steps.\n\n\`\`\`sql\n-- Aggregated cohort performance\nSELECT \n    DATE_TRUNC('month', order_date) AS cohort_month,\n    COUNT(DISTINCT customer_id) AS active_users,\n    ROUND(AVG(total_amount), 2) AS avg_order_value\nFROM transactions\nGROUP BY 1\nORDER BY 1 DESC;\n\`\`\`\n\n## 3. Statistical Analysis & DAX Metrics\n\n\`\`\`python\nimport pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("analytics_dataset.csv")\nsummary = df.groupby('segment')['revenue'].agg(['mean', 'median', 'std'])\nprint(summary)\n\`\`\`\n\n## 4. Key Findings & Strategic Impact\n\n| Operational KPI | Pre-Optimization | Post-Optimization | Net Variance |\n|---|---|---|---|\n| Query Latency | 4.2 sec | 0.45 sec | -89% |\n| Data Pipeline SLA | 94.2% | 99.8% | +5.6% |\n| Cost per Query | $0.014 | $0.003 | -78% |\n\n## 5. Conclusion & Actionable Next Steps\n\n- Integrate real-time webhook telemetry.\n- Deploy automated anomaly alerts into Slack.`
      }));
      toast.success('Technical Case Study template loaded!');
    } else if (templateType === 'powerbi-tutorial') {
      setFormData(prev => ({
        ...prev,
        content: `## Overview: Designing Enterprise Power BI Dashboards\n\nIn this walkthrough, we explore building an interactive executive dashboard with DAX dynamic measures.\n\n> [!TIP]\n> Always disable auto-date/time hierarchies in Power BI Options to reduce model memory footprint.\n\n## Star Schema Modeling\n\nEnsure a strict 1-to-many relationship between Dimension tables and Fact tables.\n\n\`\`\`sql\n-- Fact Table Extraction\nSELECT \n    f.order_id,\n    f.customer_key,\n    f.product_key,\n    f.order_amount\nFROM fact_sales f\nWHERE f.status = 'Completed';\n\`\`\`\n\n## Advanced DAX Measures\n\n\`\`\`sql\n// DAX Calculation: 30-Day Rolling Average\nRolling30DaySales =\nCALCULATE(\n    [Total Sales],\n    DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -30, DAY)\n)\n\`\`\`\n\n## Key Visual Insights\n\n- 82% of revenue concentrated in top 3 customer cohorts.\n- Return rate declined by 14% after automated quality check pipeline.`
      }));
      toast.success('Power BI Tutorial template loaded!');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    const extraMeta = {
      category: formData.category || 'Data Analytics',
      imageCaption: formData.image_caption || '',
      videoUrl: formData.video_url || '',
      powerbiUrl: formData.powerbi_url || '',
      githubLink: formData.github_link || 'https://github.com/arun-pandian-p',
      liveLink: formData.live_link || '',
      seoTitle: formData.seo_title || formData.title,
      seoDescription: formData.seo_description || formData.excerpt,
      socialImage: formData.social_image || formData.cover_image,
    };

    // Serialize extra metadata into content safely
    const serializedContent = serializeBlogContent(formData.content, extraMeta);

    // Auto-calculate reading time if not explicitly set
    const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
    const calculatedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    // Database payload
    const payload = {
      title: formData.title || 'Untitled Article',
      slug: formData.slug || (formData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      excerpt: formData.excerpt || '',
      content: serializedContent,
      tags: typeof formData.tags === 'string'
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(formData.tags) ? formData.tags : [],
      read_time: formData.read_time || calculatedReadTime,
      author_name: formData.author_name || 'Arun Pandian',
      author_avatar: formData.author_avatar || '',
      cover_image: formData.cover_image || '',
      published: Boolean(formData.published),
      featured: Boolean(formData.featured),
      sort_order: Number(formData.sort_order) || 0
    };

    try {
      if (editingBlog) {
        // Update
        const { error } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', editingBlog.id);
        if (error) throw error;
        toast.success('Blog post updated successfully!');
      } else {
        // Insert
        const { error } = await supabase
          .from('blogs')
          .insert([payload]);
        if (error) throw error;
        toast.success('Blog post published successfully!');
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      toast.error('Error saving blog: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Render markdown in live preview
  const renderLivePreview = (markdownText) => {
    if (!markdownText) {
      return (
        <div className="py-20 text-center text-slate-400 font-mono text-xs">
          Start typing on the left to see instant live preview...
        </div>
      );
    }

    const blocks = markdownText.split('\n\n');
    let codeIdx = 0;

    return (
      <div className="space-y-4 font-sans text-slate-800 text-sm leading-relaxed max-w-2xl mx-auto">
        {formData.cover_image && (
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-900 mb-6">
            <img src={formData.cover_image} alt={formData.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="border-b border-slate-100 pb-4 mb-4">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            {formData.category || 'Data Analytics'}
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-2 mb-2 leading-tight">
            {formData.title || 'Untitled Article Title'}
          </h1>
          {formData.excerpt && (
            <p className="text-slate-500 text-sm leading-relaxed italic">
              {formData.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-3 pt-3 border-t border-slate-100">
            <span>{formData.author_name || 'Arun Pandian'}</span>
            <span>•</span>
            <span>{formData.published_at || 'Today'}</span>
            <span>•</span>
            <span>{Math.max(1, Math.ceil(markdownText.trim().split(/\s+/).filter(Boolean).length / 200))} min read</span>
          </div>
        </div>

        {blocks.map((block, idx) => {
          const trimmed = block.trim();

          // H1
          if (trimmed.startsWith('# ')) {
            return <h1 key={idx} className="font-serif font-black text-2xl text-slate-900 mt-6 mb-2">{trimmed.replace(/^#\s+/, '')}</h1>;
          }
          // H2
          if (trimmed.startsWith('## ')) {
            return <h2 key={idx} className="font-serif font-bold text-xl text-slate-900 mt-6 mb-2 pb-1 border-b border-slate-100">{trimmed.replace(/^##\s+/, '')}</h2>;
          }
          // H3
          if (trimmed.startsWith('### ')) {
            return <h3 key={idx} className="font-sans font-bold text-base text-slate-900 mt-4 mb-1">{trimmed.replace(/^###\s+/, '')}</h3>;
          }
          // H4
          if (trimmed.startsWith('#### ')) {
            return <h4 key={idx} className="font-sans font-bold text-sm text-slate-800 mt-3 mb-1 uppercase tracking-wide text-xs">{trimmed.replace(/^####\s+/, '')}</h4>;
          }

          // Callout Boxes (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT])
          if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!IMPORTANT]')) {
            const lines = trimmed.split('\n');
            const alertType = lines[0].replace('> [!', '').replace(']', '').trim();
            const alertBody = lines.slice(1).map(l => l.replace(/^>\s?/, '')).join(' ');

            let alertColor = 'bg-blue-50/80 border-blue-500 text-blue-950';
            let Icon = Info;
            if (alertType === 'TIP') { alertColor = 'bg-emerald-50/80 border-emerald-500 text-emerald-950'; Icon = Lightbulb; }
            if (alertType === 'WARNING') { alertColor = 'bg-amber-50/80 border-amber-500 text-amber-950'; Icon = AlertTriangle; }
            if (alertType === 'IMPORTANT') { alertColor = 'bg-indigo-50/80 border-indigo-600 text-indigo-950'; Icon = AlertCircle; }

            return (
              <div key={idx} className={`p-3.5 rounded-xl border-l-4 my-3 text-xs leading-relaxed ${alertColor}`}>
                <div className="flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider mb-1">
                  <Icon size={14} />
                  <span>{alertType}</span>
                </div>
                <p>{alertBody}</p>
              </div>
            );
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="p-3.5 my-3 border-l-4 border-slate-900 bg-slate-50 rounded-r-xl italic font-serif text-slate-700 text-sm">
                "{trimmed.replace(/^>\s?/gm, '')}"
              </blockquote>
            );
          }

          // Code block
          if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
            codeIdx++;
            const lines = trimmed.split('\n');
            const lang = lines[0].replace('```', '').trim() || 'code';
            const body = lines.slice(1, -1).join('\n');
            return (
              <div key={idx} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0E1726] font-mono text-xs">
                <div className="px-3 py-1.5 bg-[#172338] border-b border-slate-800 text-[10px] font-bold uppercase text-blue-400 flex justify-between items-center">
                  <span>{lang}</span>
                  <span className="text-slate-500">Snippet #{codeIdx}</span>
                </div>
                <pre className="p-3.5 text-blue-200 overflow-x-auto leading-relaxed">
                  <code>{body}</code>
                </pre>
              </div>
            );
          }

          // Markdown Image ![Caption](url)
          const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
          if (imgMatch) {
            return (
              <figure key={idx} className="my-4">
                <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto rounded-xl border border-slate-200 shadow-xs" />
                {imgMatch[1] && <figcaption className="text-center text-[11px] font-serif italic text-slate-500 mt-1.5">{imgMatch[1]}</figcaption>}
              </figure>
            );
          }

          // Markdown Table
          if (trimmed.includes('|') && trimmed.split('\n').length >= 2) {
            const rows = trimmed.split('\n').filter(r => r.trim().startsWith('|'));
            if (rows.length >= 2) {
              const headers = rows[0].split('|').map(h => h.trim()).filter(Boolean);
              const dataRows = rows.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean));
              return (
                <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-slate-200 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        {headers.map((h, hIdx) => <th key={hIdx} className="px-3 py-2 font-mono uppercase text-[10px]">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataRows.map((r, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          {r.map((c, cIdx) => <td key={cIdx} className="px-3 py-2">{c}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }

          // Bullet List
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const items = trimmed.split('\n').map(i => i.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
            return (
              <ul key={idx} className="my-2 space-y-1 list-disc list-inside text-slate-700 text-xs">
                {items.map((item, itemIdx) => <li key={itemIdx} className="marker:text-blue-600">{item}</li>)}
              </ul>
            );
          }

          // Numbered List
          if (/^\d+\.\s/.test(trimmed)) {
            const items = trimmed.split('\n').map(i => i.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
            return (
              <ol key={idx} className="my-2 space-y-1 list-decimal list-inside text-slate-700 text-xs">
                {items.map((item, itemIdx) => <li key={itemIdx} className="marker:font-bold">{item}</li>)}
              </ol>
            );
          }

          // Collapsible FAQ Details
          if (trimmed.startsWith('<details>')) {
            const sumMatch = trimmed.match(/<summary>(.*?)<\/summary>/);
            const summary = sumMatch ? sumMatch[1] : 'Click to expand';
            const body = trimmed.replace(/<details>[\s\S]*?<summary>.*?<\/summary>/, '').replace(/<\/details>/, '').trim();
            return (
              <details key={idx} className="my-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs cursor-pointer">
                <summary className="font-bold text-slate-800">{summary}</summary>
                <div className="pt-2 mt-2 border-t border-slate-200 text-slate-600">{body}</div>
              </details>
            );
          }

          // Divider
          if (trimmed === '---' || trimmed === '***') {
            return <hr key={idx} className="my-6 border-slate-200" />;
          }

          // Paragraph
          return (
            <p key={idx} className="text-slate-700 text-xs leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  const filteredBlogs = blogs
    .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.slug.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'Alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  const charCount = formData.content.length;
  const headingsCount = (formData.content.match(/^#{1,4}\s+/gm) || []).length;

  if (loading && blogs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800">
      {/* Top Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option>Latest Published</option>
            <option>Alphabetical</option>
          </select>
          
          <div className="flex items-center p-1 rounded-xl border border-slate-200 bg-white">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <List size={16} />
            </button>
          </div>

          <button 
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Grid or List View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Article Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                      No blog posts found.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {b.cover_image && (
                            <img src={b.cover_image} alt={b.title} className="h-10 w-10 rounded-lg object-cover shrink-0 border border-slate-200 bg-slate-900" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{b.title}</span>
                            <span className="text-xs text-slate-400 font-mono mt-0.5">/{b.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {b.author_name || 'Arun Pandian'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${b.published ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {b.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          {b.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleTogglePublish(b)}
                            title={b.published ? 'Hide Post' : 'Publish Post'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              b.published
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                            }`}
                          >
                            {b.published ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                          <a 
                            href={`/blog/${b.slug || b.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View Live Blog"
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors inline-flex cursor-pointer" 
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button 
                            onClick={() => openModal(b)}
                            title="Edit Blog"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer" 
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(b)}
                            title="Delete Blog"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer" 
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlogs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-[1.25rem] border border-slate-100 shadow-sm">
              No blog posts found.
            </div>
          ) : (
            filteredBlogs.map((b) => (
              <div key={b.id} className="bg-white p-6 rounded-[1.25rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex flex-col w-full">
                    {b.cover_image && (
                      <img src={b.cover_image} alt={b.title} className="w-full h-36 object-cover rounded-xl border border-slate-100 mb-4 bg-slate-900" />
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider mb-3 w-fit ${b.published ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                      {b.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                      {b.published ? 'Published' : 'Draft'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-2 leading-snug">{b.title}</h3>
                    <span className="text-xs text-slate-400 font-mono">/{b.slug}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1 leading-relaxed">
                  {b.excerpt || 'No excerpt available.'}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {b.author_name ? b.author_name.substring(0, 1).toUpperCase() : 'A'}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{b.author_name || 'Arun Pandian'}</span>
                  </div>
                  
                  {/* Action Bar */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleTogglePublish(b)} 
                      title={b.published ? 'Hide Post' : 'Publish Post'}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        b.published 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                    >
                      {b.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <a 
                      href={`/blog/${b.slug || b.id}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      title="View Live Blog"
                      className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button 
                      onClick={() => openModal(b)} 
                      title="Edit Post"
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(b)} 
                      title="Delete Post"
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Hidden file input for inline direct image upload */}
      <input
        type="file"
        ref={inlineFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleInlineImageFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Elementor-Style Live Split-Screen Article Editor Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingBlog ? `Edit: ${formData.title || 'Technical Article'}` : "Create Technical Publication"}
        maxWidth={isFullscreen ? "max-w-[98vw] w-[98vw]" : "max-w-6xl w-full"}
        headerActions={
          <div className="flex items-center gap-1.5 mr-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Top Control Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              {[
                { id: 'editor', label: '✍️ Elementor Editor & Live Preview' },
                { id: 'core', label: '📝 Article Meta & Details' },
                { id: 'media', label: '🖼️ Hero Cover & Embeds' },
                { id: 'seo', label: '🔍 SEO & Social Preview' },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveModalTab(tab.id)}
                  className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                    activeModalTab === tab.id
                      ? 'bg-white text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeModalTab === 'editor' && (
              <div className="flex items-center gap-2">
                {/* Editor View Switcher: Split / Write / Preview */}
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setEditorViewMode('write')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      editorViewMode === 'write' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <Type size={12} />
                    <span>Write</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorViewMode('split')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      editorViewMode === 'split' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <Columns size={12} />
                    <span>Live Split</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorViewMode('preview')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      editorViewMode === 'preview' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <Eye size={12} />
                    <span>Reader Mode</span>
                  </button>
                </div>

                {/* Template Preset Dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) applyTemplate(e.target.value);
                    e.target.value = '';
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-50"
                  defaultValue=""
                >
                  <option value="" disabled>✨ Load Template</option>
                  <option value="case-study">Technical Case Study</option>
                  <option value="powerbi-tutorial">Power BI & DAX Tutorial</option>
                </select>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: ELEMENTOR-STYLE RICH EDITOR WITH LIVE SPLIT PREVIEW
              ══════════════════════════════════════════════════════════════════ */}
          {activeModalTab === 'editor' && (
            <div className="space-y-3">
              
              {/* Quick Article Title & URL Slug Bar in Editor */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="md:col-span-8">
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const autoSlug = !editingBlog || !formData.slug
                        ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                        : formData.slug;
                      setFormData({ ...formData, title: newTitle, slug: autoSlug });
                    }}
                    placeholder="Enter Article Title here..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-4">
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                    placeholder="url-slug"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-600 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Comprehensive Elementor Rich Blocks Insertion Toolbar */}
              <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 flex flex-wrap items-center gap-1 text-xs">
                
                {/* Heading Blocks */}
                <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-300">
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('## Section Heading\n\nSection narrative text...')}
                    title="Insert Heading 2"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 cursor-pointer"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('### Subsection Heading\n\nSubsection content...')}
                    title="Insert Heading 3"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 cursor-pointer"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('#### Sub-point\n\nDetail content...')}
                    title="Insert Heading 4"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 cursor-pointer"
                  >
                    H4
                  </button>
                </div>

                {/* Inline Formatting */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-300">
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('**bold text**')}
                    title="Bold Text"
                    className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer font-bold"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('*italic text*')}
                    title="Italic Text"
                    className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer italic"
                  >
                    <Italic size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('`inline code`')}
                    title="Inline Code"
                    className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 font-mono text-xs border border-slate-200 cursor-pointer"
                  >
                    <Code size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('> Quotation text or notable statement here.')}
                    title="Blockquote"
                    className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    <Quote size={13} />
                  </button>
                </div>

                {/* Callout Alert Boxes */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-300">
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('> [!NOTE]\n> Note context or analytical insight.')}
                    title="Insert Note Callout Box"
                    className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 cursor-pointer flex items-center gap-1"
                  >
                    <Info size={12} />
                    <span>Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('> [!TIP]\n> Actionable performance tip or best practice.')}
                    title="Insert Tip Callout Box"
                    className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 cursor-pointer flex items-center gap-1"
                  >
                    <Lightbulb size={12} />
                    <span>Tip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('> [!WARNING]\n> Critical operational caveat or warning.')}
                    title="Insert Warning Callout Box"
                    className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-[11px] border border-amber-200 cursor-pointer flex items-center gap-1"
                  >
                    <AlertTriangle size={12} />
                    <span>Warning</span>
                  </button>
                </div>

                {/* Code Snippets (SQL, Python, DAX) */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-300">
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('```sql\n-- SQL Query\nSELECT category, SUM(amount) AS total\nFROM sales\nGROUP BY category\nORDER BY total DESC;\n```')}
                    title="Insert SQL Code Block"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-blue-700 font-mono text-[11px] font-bold border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <Database size={11} />
                    <span>SQL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('```python\nimport pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("dataset.csv")\nprint(df.describe())\n```')}
                    title="Insert Python Code Block"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-emerald-700 font-mono text-[11px] font-bold border border-slate-200 cursor-pointer"
                  >
                    Python
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('```sql\n// DAX Measure\nTotalRevenueYTD =\nTOTALYTD(SUM(Sales[Revenue]), \'Date\'[Date])\n```')}
                    title="Insert DAX Measure Block"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-purple-700 font-mono text-[11px] font-bold border border-slate-200 cursor-pointer"
                  >
                    DAX
                  </button>
                </div>

                {/* Table, Lists & Accordion */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-300">
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('| Metric | Benchmark | Actual | Variance |\n|---|---|---|---|\n| Conversion | 3.2% | 4.6% | +43% |\n| Latency | 250ms | 45ms | -82% |')}
                    title="Insert Data Table"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <Table size={12} />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('- Key observation 1\n- Key observation 2\n- Key observation 3')}
                    title="Bullet List"
                    className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    <List size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('<details>\n<summary>Frequently Asked Analytical Question</summary>\n\nDetailed technical explanation here.\n</details>')}
                    title="Collapsible Accordion / FAQ"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle size={12} />
                    <span>FAQ</span>
                  </button>
                </div>

                {/* Direct Image Upload & Image URL */}
                <div className="flex items-center gap-1 pl-1">
                  <button
                    type="button"
                    onClick={() => inlineFileInputRef.current?.click()}
                    disabled={uploadingInlineImage}
                    title="Upload Image from Device and Insert"
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {uploadingInlineImage ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    <span>{uploadingInlineImage ? 'Uploading...' : 'Upload Image'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageModalOpen(true)}
                    title="Insert Image by URL"
                    className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <ImageIcon size={12} />
                    <span>Image URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertMarkdownSnippet('[Explore Verified Source](https://github.com/arun-pandian-p)')}
                    title="Insert Link"
                    className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    <LinkIcon size={13} />
                  </button>
                </div>

              </div>

              {/* Main Writing Area / Split View */}
              <div className={`grid gap-4 ${editorViewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                
                {/* Left: Code / Markdown Textarea */}
                {(editorViewMode === 'write' || editorViewMode === 'split') && (
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-500 px-1">
                      <span>Markdown Source Editor</span>
                      <span>{charCount} chars | {wordCount} words</span>
                    </div>
                    <textarea
                      ref={editorTextareaRef}
                      rows={isFullscreen ? 24 : 16}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full p-4 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed resize-y h-[420px]"
                      placeholder="Write your technical article in Markdown with rich elements..."
                    />
                  </div>
                )}

                {/* Right: Live Rendered Split Preview */}
                {(editorViewMode === 'preview' || editorViewMode === 'split') && (
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-blue-700 px-1">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Reader Preview
                      </span>
                      <span className="text-slate-400">{headingsCount} headings | {estimatedReadTime}</span>
                    </div>
                    <div className="w-full p-5 rounded-xl border border-slate-200 bg-white overflow-y-auto max-h-[420px] shadow-2xs">
                      {renderLivePreview(formData.content)}
                    </div>
                  </div>
                )}

              </div>

              {/* Content Metrics Footer Bar */}
              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span>Words: <strong className="text-slate-700">{wordCount}</strong></span>
                  <span>Estimated: <strong className="text-slate-700">{estimatedReadTime}</strong></span>
                  <span>Headings: <strong className="text-slate-700">{headingsCount}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-600 font-semibold">● Auto-syncs live preview</span>
                </div>
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: CORE DETAILS & METADATA
              ══════════════════════════════════════════════════════════════════ */}
          {activeModalTab === 'core' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Article Title *
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const autoSlug = !editingBlog || !formData.slug
                      ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                      : formData.slug;
                    setFormData({ ...formData, title: newTitle, slug: autoSlug });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:border-blue-500 outline-none"
                  placeholder="e.g. Analyzing Delivery Performance with Power BI & DAX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:border-blue-500 outline-none"
                    placeholder="e.g. delivery-performance-power-bi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Primary Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                    placeholder="e.g. Data Analytics, Power BI, SQL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Executive Excerpt / Subtitle *
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none leading-relaxed"
                  placeholder="A concise 1-2 sentence executive summary of the investigation..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Reading Time
                  </label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    placeholder="e.g. 5 min read"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  placeholder="Power BI, SQL, Statistics, DAX"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Published to live site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Featured Hero Showcase</span>
                </label>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: MEDIA & EMBEDS
              ══════════════════════════════════════════════════════════════════ */}
          {activeModalTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Hero Cover Image (Upload or Paste URL)
                </label>
                <ImageUpload
                  url={formData.cover_image}
                  onUpload={(url) => setFormData({ ...formData, cover_image: url })}
                  folder="blogs"
                  label="Article Banner Image"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cover Image Caption
                </label>
                <input
                  type="text"
                  value={formData.image_caption}
                  onChange={(e) => setFormData({ ...formData, image_caption: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  placeholder="e.g. Figure 1.1 — Interactive Power BI Dashboard for Fleet Delivery Metrics"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    YouTube / Video Embed URL
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Power BI / App Embed URL
                  </label>
                  <input
                    type="url"
                    value={formData.powerbi_url}
                    onChange={(e) => setFormData({ ...formData, powerbi_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    placeholder="https://app.powerbi.com/view?r=..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    value={formData.github_link}
                    onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    placeholder="https://github.com/arun-pandian-p/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Live Demo / Dashboard URL
                  </label>
                  <input
                    type="url"
                    value={formData.live_link}
                    onChange={(e) => setFormData({ ...formData, live_link: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 4: SEO & SOCIAL PREVIEW
              ══════════════════════════════════════════════════════════════════ */}
          {activeModalTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  placeholder={formData.title || 'SEO Title Tag'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  placeholder={formData.excerpt || 'Google search snippet description...'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Social Preview Image URL
                </label>
                <input
                  type="url"
                  value={formData.social_image}
                  onChange={(e) => setFormData({ ...formData, social_image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                  placeholder={formData.cover_image || 'https://...'}
                />
              </div>

              {/* Google Snippet Live Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  Google Search Snippet Preview:
                </span>
                <div className="text-xs text-blue-800 font-mono truncate">
                  https://arunpandian.me/blog/{formData.slug || 'slug'}
                </div>
                <div className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                  {formData.seo_title || formData.title || 'Article Title'}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {formData.seo_description || formData.excerpt || 'Meta description preview...'}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{saving ? 'Saving...' : editingBlog ? 'Save Changes' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Insert Image via URL Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ImageIcon size={16} className="text-blue-600" />
              <span>Insert Image by URL</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL *</label>
              <input
                type="url"
                required
                value={inlineImageUrl}
                onChange={(e) => setInlineImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Caption / Description</label>
              <input
                type="text"
                value={inlineImageCaption}
                onChange={(e) => setInlineImageCaption(e.target.value)}
                placeholder="e.g. Figure 2.1 — Distribution Heatmap"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertUrlImage}
                disabled={!inlineImageUrl.trim()}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                Insert into Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to permanently delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmText="Delete Post"
        confirmVariant="danger"
      />
    </div>
  );
}
