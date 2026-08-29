import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, Plus, Edit2, Trash2, Search, Filter, 
  List, Grid, RefreshCw, Download, ExternalLink, Eye, EyeOff,
  Image as ImageIcon, Video, Code, Table, Link as LinkIcon,
  Sparkles, Calendar, Clock, User, Check,
  Info, Lightbulb, AlertTriangle, AlertCircle,
  Columns, Type, Heading1, Heading2, Heading3, Heading4, Bold, Italic,
  Quote, ListOrdered, Minus, Database, Upload, X, ChevronDown, ChevronRight,
  Settings, Globe, Share2, Layers, BookOpen, Undo, Redo, Bell, Send, Mail
} from 'lucide-react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { parseArticleMetadata, serializeBlogContent } from '../../utils/blogParser';
import { sendSubscriberBroadcast } from '../../services/newsletterService';
import toast from 'react-hot-toast';

export default function Blogs() {
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Latest Published');
  const [viewMode, setViewMode] = useState('grid');

  // Studio / Editor state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editorViewMode, setEditorViewMode] = useState('write'); // 'write' | 'split' | 'preview'
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [manageDrawerOpen, setManageDrawerOpen] = useState(false);
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [coverUrlInputOpen, setCoverUrlInputOpen] = useState(false);
  const [manageTab, setManageTab] = useState('general'); // 'general' | 'seo' | 'embeds' | 'templates'

  // Deletion Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  // Undo / Redo History Stack for Editor
  const [historyStack, setHistoryStack] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  // File Inputs & Textarea Refs
  const coverFileInputRef = useRef(null);
  const inlineFileInputRef = useRef(null);
  const editorTextareaRef = useRef(null);
  const titleTextareaRef = useRef(null);

  // Inline Image Inserter Modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const [inlineImageCaption, setInlineImageCaption] = useState('');

  // Form state
  const emptyBlog = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Data Analytics',
    tags: 'Power BI, SQL, Data Analytics, Python',
    read_time: '5 min read',
    author_name: 'Arun Pandian P',
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
    allow_comments: true,
    sort_order: 0
  };

  const [formData, setFormData] = useState(emptyBlog);
  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [customMailSubject, setCustomMailSubject] = useState('');
  const [customMailMessage, setCustomMailMessage] = useState('');
  const [customMailCta, setCustomMailCta] = useState('');

  // Push state to undo/redo history stack
  const updateContentWithHistory = (newContent) => {
    setHistoryStack((prev) => {
      const upToCurrent = prev.slice(0, historyPointer + 1);
      return [...upToCurrent, newContent].slice(-50);
    });
    setHistoryPointer((prev) => Math.min(prev + 1, 49));
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevIndex = historyPointer - 1;
      const targetContent = historyStack[prevIndex];
      setHistoryPointer(prevIndex);
      setFormData((prev) => ({ ...prev, content: targetContent }));
      toast('Undo (Ctrl+Z)', { icon: '↩️' });
    }
  };

  const handleRedo = () => {
    if (historyPointer < historyStack.length - 1) {
      const nextIndex = historyPointer + 1;
      const targetContent = historyStack[nextIndex];
      setHistoryPointer(nextIndex);
      setFormData((prev) => ({ ...prev, content: targetContent }));
      toast('Redo (Ctrl+Y)', { icon: '↪️' });
    }
  };

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
      if (isModalOpen && editingBlog?.id === deleteConfirm.id) {
        setIsModalOpen(false);
      }
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
    setEditorViewMode('write');
    setStyleDropdownOpen(false);
    setManageDrawerOpen(false);
    setAuthorDropdownOpen(false);

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
        author_name: blog.author_name || 'Arun Pandian P',
        author_avatar: blog.author_avatar || 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png',
        published_at: blog.published_at ? new Date(blog.published_at).toISOString().split('T')[0] : (blog.created_at ? new Date(blog.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
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
      setHistoryStack([cleanContent || '']);
      setHistoryPointer(0);
    } else {
      setEditingBlog(null);
      const initialContent = `## 1. Executive Summary & Objective\n\nStart your data analysis article here...\n\n## 2. Dataset Architecture & Normalization\n\nExplain the dataset schema, data cleaning, and ETL transformation pipeline.\n\n\`\`\`sql\n-- Sample SQL query\nSELECT category, COUNT(*) AS total_orders\nFROM sales_data\nGROUP BY category;\n\`\`\`\n\n## 3. Key Findings & Business Impact\n\n> [!NOTE]\n> Automated anomaly detection identified 18% variance in peak hours.\n\n| Metric | Baseline | Optimized | Lift |\n|---|---|---|---|\n| Avg Lead Time | 24 hrs | 14 hrs | +41% |\n| Conversion Rate | 2.8% | 4.1% | +46% |`;
      setFormData({
        ...emptyBlog,
        content: initialContent,
        sort_order: blogs.length > 0 ? Math.max(...blogs.map(b => b.sort_order || 0)) + 1 : 1
      });
      setHistoryStack([initialContent]);
      setHistoryPointer(0);
    }
    setIsModalOpen(true);
  };

  // Selection-aware text wrapper (Code blocks, inline code, bold, italic, headings)
  const wrapSelection = (beforeStr, afterStr, defaultText = 'text') => {
    const textarea = editorTextareaRef.current;
    if (!textarea) {
      insertMarkdownSnippet(`${beforeStr}${defaultText}${afterStr}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const content = formData.content;

    const replacement = `${beforeStr}${selected || defaultText}${afterStr}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    
    updateContentWithHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start + beforeStr.length, start + beforeStr.length + selected.length);
      } else {
        textarea.setSelectionRange(start + beforeStr.length, start + beforeStr.length + defaultText.length);
      }
    }, 50);
  };

  // Helper to insert markdown snippet at cursor or append
  const insertMarkdownSnippet = (snippet) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) {
      updateContentWithHistory(formData.content ? `${formData.content}\n\n${snippet}` : snippet);
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
    updateContentWithHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + snippet.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Keyboard Shortcuts Handler (Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+S, Ctrl+Z, Ctrl+Y, Tab)
  const handleEditorKeyDown = (e) => {
    const ctrlKey = e.ctrlKey || e.metaKey;

    if (ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      wrapSelection('**', '**', 'bold text');
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      wrapSelection('*', '*', 'italic text');
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      wrapSelection('[', '](https://)', 'link title');
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = editorTextareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = formData.content;

      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      updateContentWithHistory(newContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Direct Cover Image File Upload via Device File Picker
  const handleCoverFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, GIF)');
      return;
    }

    try {
      setUploadingCover(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `cover_${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, cover_image: data.publicUrl }));
      toast.success('Cover image uploaded successfully!', { icon: '🖼️' });
    } catch (err) {
      toast.error('Error uploading cover: ' + err.message);
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
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

    if (templateType === 'medallion-architecture') {
      setFormData(prev => ({
        ...prev,
        title: prev.title || 'Architecting Enterprise Data Lakehouse with Medallion Pattern',
        category: 'Data Engineering',
        tags: 'Data Engineering, SQL, Python, Medallion Architecture',
        content: `## 1. Executive Context: The Evolution of Lakehouse Layers\n\nThe Medallion architecture (Bronze ➔ Silver ➔ Gold) solved data sprawl and multi-hop transformation reliability for over a decade.\n\n> [!NOTE]\n> Core principle: Each progressive layer earns greater data quality, business schema compliance, and consumer trust.\n\n## 2. Bronze Layer: Raw Streaming & Append-Only Ingestion\n\nPreserves raw untransformed source logs with timestamp indexing and schema drift detection.\n\n\`\`\`sql\n-- Bronze Landing Query: Raw JSON Extraction\nSELECT \n    event_id,\n    ingest_timestamp,\n    raw_payload:customer_id::INT AS customer_id,\n    raw_payload:amount::NUMERIC(10,2) AS order_amount\nFROM bronze_raw_telemetry\nWHERE ingest_timestamp >= CURRENT_DATE - INTERVAL '1 day';\n\`\`\`\n\n## 3. Silver Layer: Cleansed, Conformed, and Deduplicated Dimensions\n\n\`\`\`python\nimport pandas as pd\n\n# Deduplication & NULL imputation pipeline\ndef process_silver_layer(raw_df):\n    cleansed = raw_df.drop_duplicates(subset=['event_id'])\n    cleansed['amount'] = cleansed['amount'].fillna(0.0)\n    return cleansed\n\`\`\`\n\n## 4. Gold Layer: Star Schema & DAX Business Models\n\n| Architecture Layer | SLA Target | Storage Format | Business Consumer |\n|---|---|---|---|\n| Bronze (Raw) | < 5 min | Parquet / Delta | Data Engineers |\n| Silver (Cleansed) | < 30 min | Delta Lake | Data Analysts |\n| Gold (Aggregated) | < 2 hrs | Star Schema / Power BI | Executives & ML Models |\n\n## 5. Summary & Actionable Recommendations\n\n- Automate schema migration validations.\n- Enforce ACID transactional consistency across pipelines.`
      }));
      toast.success('Medallion Architecture template loaded!');
    } else if (templateType === 'case-study') {
      setFormData(prev => ({
        ...prev,
        title: prev.title || 'Fleet Logistics & Peak Delivery Optimization Case Study',
        category: 'Analytics Case Study',
        tags: 'Power BI, SQL, Statistics, Python',
        content: `## 1. Executive Problem Statement\n\nBrief overview of the business challenge, baseline metrics, and stakeholder objectives.\n\n> [!NOTE]\n> Key hypothesis: Enhancing ETL automation and index optimization will yield a 35% throughput increase.\n\n## 2. Dataset Architecture & ETL Pipeline\n\nDescribe the raw schema, normalization techniques, and transformation steps.\n\n\`\`\`sql\n-- Aggregated cohort performance\nSELECT \n    DATE_TRUNC('month', order_date) AS cohort_month,\n    COUNT(DISTINCT customer_id) AS active_users,\n    ROUND(AVG(total_amount), 2) AS avg_order_value\nFROM transactions\nGROUP BY 1\nORDER BY 1 DESC;\n\`\`\`\n\n## 3. Statistical Analysis & DAX Metrics\n\n\`\`\`python\nimport pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("analytics_dataset.csv")\nsummary = df.groupby('segment')['revenue'].agg(['mean', 'median', 'std'])\nprint(summary)\n\`\`\`\n\n## 4. Key Findings & Strategic Impact\n\n| Operational KPI | Pre-Optimization | Post-Optimization | Net Variance |\n|---|---|---|---|\n| Query Latency | 4.2 sec | 0.45 sec | -89% |\n| Data Pipeline SLA | 94.2% | 99.8% | +5.6% |\n| Cost per Query | $0.014 | $0.003 | -78% |\n\n## 5. Conclusion & Actionable Next Steps\n\n- Integrate real-time webhook telemetry.\n- Deploy automated anomaly alerts into Slack.`
      }));
      toast.success('Technical Case Study template loaded!');
    } else if (templateType === 'powerbi-tutorial') {
      setFormData(prev => ({
        ...prev,
        title: prev.title || 'Building Executive Power BI Dashboards with Dynamic DAX Measures',
        category: 'Power BI',
        tags: 'Power BI, DAX, Data Modeling, Star Schema',
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
      author_name: formData.author_name || 'Arun Pandian P',
      author_avatar: formData.author_avatar || '',
      cover_image: formData.cover_image || '',
      published: Boolean(formData.published),
      featured: Boolean(formData.featured),
      allow_comments: formData.allow_comments !== false,
      sort_order: Number(formData.sort_order) || 0,
      published_at: formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString(),
      created_at: formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString()
    };

    try {
      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', editingBlog.id);
        if (error) throw error;
        toast.success('Blog post updated successfully!');
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([payload]);
        if (error) throw error;
        toast.success('Blog post published successfully!');
      }

      // If notifySubscribers is ON and post is published, broadcast to all newsletter fans
      if (payload.published && notifySubscribers) {
        // Pick random reading social proof between 100-129 for this publication
        const randomReaders = Math.floor(Math.random() * (129 - 100 + 1)) + 100;
        
        // Extract notable quote from content if present
        let quoteMatch = payload.content.match(/^>\s*(.+)$/m);
        const quote = quoteMatch ? quoteMatch[1] : '';

        sendSubscriberBroadcast({
          title: payload.title,
          subject: customMailSubject || undefined,
          customMessage: customMailMessage || undefined,
          ctaText: customMailCta || undefined,
          excerpt: payload.excerpt,
          slug: payload.slug,
          type: 'blog',
          imageUrl: payload.cover_image,
          quote: quote
        }).then((res) => {
          if (res?.success) {
            toast.success(`Dispatched update to fans! (🔥 ${randomReaders} readers score)`, { icon: '📬', duration: 4000 });
          }
        }).catch((err) => console.warn('Newsletter broadcast notice:', err));
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
        <div className="py-20 text-center text-slate-400 font-mono text-sm">
          Start typing to see instant live preview...
        </div>
      );
    }

    const renderPreviewInlineText = (text) => {
      if (!text) return null;
      const parts = [];
      const inlineRegex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|==[^=]+==|\[[^\]]+\]\([^)]+\))/g;
      let lastIndex = 0;
      let match;
      let keyIdx = 0;

      while ((match = inlineRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={keyIdx++}>{text.substring(lastIndex, match.index)}</span>);
        }
        const rawMatch = match[0];
        if (rawMatch.startsWith('`') && rawMatch.endsWith('`')) {
          parts.push(
            <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[12px] text-slate-800 font-medium">
              {rawMatch.slice(1, -1)}
            </code>
          );
        } else if (rawMatch.startsWith('***') && rawMatch.endsWith('***')) {
          parts.push(<strong key={keyIdx++} className="font-bold italic text-slate-950">{rawMatch.slice(3, -3)}</strong>);
        } else if (rawMatch.startsWith('**') && rawMatch.endsWith('**')) {
          parts.push(<strong key={keyIdx++} className="font-bold text-slate-950">{rawMatch.slice(2, -2)}</strong>);
        } else if (rawMatch.startsWith('*') && rawMatch.endsWith('*')) {
          parts.push(<em key={keyIdx++} className="italic text-slate-800">{rawMatch.slice(1, -1)}</em>);
        } else if (rawMatch.startsWith('~~') && rawMatch.endsWith('~~')) {
          parts.push(<del key={keyIdx++} className="line-through text-slate-400">{rawMatch.slice(2, -2)}</del>);
        } else if (rawMatch.startsWith('==') && rawMatch.endsWith('==')) {
          parts.push(<mark key={keyIdx++} className="bg-amber-200/80 px-1 py-0.5 rounded text-slate-900 font-medium">{rawMatch.slice(2, -2)}</mark>);
        } else if (rawMatch.startsWith('[') && rawMatch.includes('](')) {
          const linkMatch = rawMatch.match(/^\[(.*?)\]\((.*?)\)$/);
          if (linkMatch) {
            parts.push(
              <a key={keyIdx++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">
                {linkMatch[1]}
              </a>
            );
          } else {
            parts.push(<span key={keyIdx++}>{rawMatch}</span>);
          }
        } else {
          parts.push(<span key={keyIdx++}>{rawMatch}</span>);
        }
        lastIndex = match.index + rawMatch.length;
      }
      if (lastIndex < text.length) {
        parts.push(<span key={keyIdx++}>{text.substring(lastIndex)}</span>);
      }
      return parts.length > 0 ? parts : text;
    };

    let normalized = (markdownText || '')
      .replace(/[‘’`]/g, '`')
      .replace(/[“”]/g, '"')
      .replace(/^(?:H1|h1):\s*/gm, '# ')
      .replace(/^(?:H2|h2):\s*/gm, '## ')
      .replace(/^(?:H3|h3):\s*/gm, '### ')
      .replace(/^(?:H4|h4):\s*/gm, '#### ');

    const parsedBlocks = [];
    const lines = normalized.split('\n');
    let lineIdx = 0;
    let snippetNum = 0;

    while (lineIdx < lines.length) {
      const line = lines[lineIdx];
      const trimmed = line.trim();

      if (!trimmed) {
        lineIdx++;
        continue;
      }

      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim() || 'sql';
        lineIdx++;
        const codeLines = [];
        while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith('```')) {
          codeLines.push(lines[lineIdx]);
          lineIdx++;
        }
        if (lineIdx < lines.length && lines[lineIdx].trim().startsWith('```')) {
          lineIdx++;
        }
        snippetNum++;
        parsedBlocks.push({ type: 'code', lang, code: codeLines.join('\n'), num: snippetNum });
        continue;
      }

      if (trimmed.startsWith('### ')) {
        parsedBlocks.push({ type: 'heading', level: 3, text: trimmed.slice(4) });
        lineIdx++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        parsedBlocks.push({ type: 'heading', level: 2, text: trimmed.slice(3) });
        lineIdx++;
        continue;
      }
      if (trimmed.startsWith('# ')) {
        parsedBlocks.push({ type: 'heading', level: 1, text: trimmed.slice(2) });
        lineIdx++;
        continue;
      }

      if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!IMPORTANT]')) {
        const match = trimmed.match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT)\]/i);
        const alertType = match ? match[1].toUpperCase() : 'NOTE';
        lineIdx++;
        const calloutLines = [];
        while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('>')) {
          calloutLines.push(lines[lineIdx].trim().replace(/^>\s?/, ''));
          lineIdx++;
        }
        parsedBlocks.push({ type: 'callout', alertType, body: calloutLines.join(' ') });
        continue;
      }

      if (trimmed.startsWith('>')) {
        const quoteLines = [trimmed.replace(/^>\s?/, '')];
        lineIdx++;
        while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('>')) {
          quoteLines.push(lines[lineIdx].trim().replace(/^>\s?/, ''));
          lineIdx++;
        }
        parsedBlocks.push({ type: 'quote', text: quoteLines.join(' ') });
        continue;
      }

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines = [trimmed];
        lineIdx++;
        while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('|') && lines[lineIdx].trim().endsWith('|')) {
          tableLines.push(lines[lineIdx].trim());
          lineIdx++;
        }
        if (tableLines.length >= 2) {
          const headers = tableLines[0].split('|').slice(1, -1).map(h => h.trim());
          const rows = tableLines.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
          parsedBlocks.push({ type: 'table', headers, rows });
          continue;
        }
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItems = [];
        while (lineIdx < lines.length && (lines[lineIdx].trim().startsWith('- ') || lines[lineIdx].trim().startsWith('* '))) {
          listItems.push(lines[lineIdx].trim().replace(/^[-*]\s+/, ''));
          lineIdx++;
        }
        parsedBlocks.push({ type: 'unordered-list', items: listItems });
        continue;
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const listItems = [];
        while (lineIdx < lines.length && /^\d+\.\s/.test(lines[lineIdx].trim())) {
          listItems.push(lines[lineIdx].trim().replace(/^\d+\.\s+/, ''));
          lineIdx++;
        }
        parsedBlocks.push({ type: 'ordered-list', items: listItems });
        continue;
      }

      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        parsedBlocks.push({ type: 'image', caption: imgMatch[1], url: imgMatch[2] });
        lineIdx++;
        continue;
      }

      const paraLines = [line];
      lineIdx++;
      while (
        lineIdx < lines.length &&
        lines[lineIdx].trim() &&
        !lines[lineIdx].trim().startsWith('#') &&
        !lines[lineIdx].trim().startsWith('```') &&
        !lines[lineIdx].trim().startsWith('>') &&
        !lines[lineIdx].trim().startsWith('- ') &&
        !lines[lineIdx].trim().startsWith('* ') &&
        !/^\d+\.\s/.test(lines[lineIdx].trim()) &&
        !lines[lineIdx].trim().startsWith('!['))
      {
        paraLines.push(lines[lineIdx]);
        lineIdx++;
      }
      parsedBlocks.push({ type: 'paragraph', text: paraLines.join(' ') });
    }

    return (
      <div className="prose max-w-none text-slate-800 text-sm leading-relaxed">
        {formData.cover_image && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-900 mb-8">
            <img src={formData.cover_image} alt={formData.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="border-b border-slate-100 pb-6 mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            {formData.category || 'Data Analytics'}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900 mt-3 mb-3 leading-tight">
            {formData.title || 'Untitled Article Title'}
          </h1>
          {formData.excerpt && (
            <p className="text-slate-600 text-base leading-relaxed italic">
              {formData.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
            <span>{formData.author_name || 'Arun Pandian P'}</span>
            <span>•</span>
            <span>{formData.published_at ? new Date(formData.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}</span>
            <span>•</span>
            <span>{Math.max(1, Math.ceil(markdownText.trim().split(/\s+/).filter(Boolean).length / 200))} min read</span>
          </div>
        </div>

        {parsedBlocks.map((block, idx) => {
          if (block.type === 'heading') {
            if (block.level === 1) return <h1 key={idx} className="font-serif font-black text-2xl sm:text-3xl text-slate-900 mt-8 mb-3">{renderPreviewInlineText(block.text)}</h1>;
            if (block.level === 2) return <h2 key={idx} className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-7 mb-3 pb-1 border-b border-slate-100">{renderPreviewInlineText(block.text)}</h2>;
            if (block.level === 3) return <h3 key={idx} className="font-sans font-bold text-lg text-slate-900 mt-5 mb-2">{renderPreviewInlineText(block.text)}</h3>;
            return <h4 key={idx} className="font-sans font-bold text-base text-slate-800 mt-4 mb-1 uppercase tracking-wide text-xs">{renderPreviewInlineText(block.text)}</h4>;
          }

          if (block.type === 'callout') {
            let alertColor = 'bg-blue-50/80 border-blue-500 text-blue-950';
            let Icon = Info;
            if (block.alertType === 'TIP') { alertColor = 'bg-emerald-50/80 border-emerald-500 text-emerald-950'; Icon = Lightbulb; }
            if (block.alertType === 'WARNING') { alertColor = 'bg-amber-50/80 border-amber-500 text-amber-950'; Icon = AlertTriangle; }
            if (block.alertType === 'IMPORTANT') { alertColor = 'bg-indigo-50/80 border-indigo-600 text-indigo-950'; Icon = AlertCircle; }

            return (
              <div key={idx} className={`p-4 rounded-xl border-l-4 my-4 text-xs sm:text-sm leading-relaxed ${alertColor}`}>
                <div className="flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider mb-1">
                  <Icon size={15} />
                  <span>{block.alertType}</span>
                </div>
                <p>{renderPreviewInlineText(block.body)}</p>
              </div>
            );
          }

          if (block.type === 'quote') {
            return (
              <blockquote key={idx} className="p-4 my-4 border-l-4 border-slate-900 bg-slate-50 rounded-r-xl italic font-serif text-slate-700 text-base">
                "{renderPreviewInlineText(block.text)}"
              </blockquote>
            );
          }

          if (block.type === 'code') {
            return (
              <div key={idx} className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-[#0E1726] font-mono text-xs">
                <div className="px-4 py-2 bg-[#172338] border-b border-slate-800 text-[11px] font-bold uppercase text-blue-400 flex justify-between items-center">
                  <span>{block.lang}</span>
                  <span className="text-slate-500">Live Code Sandbox #{block.num}</span>
                </div>
                <pre className="p-4 text-blue-200 overflow-x-auto leading-relaxed">
                  <code>{block.code}</code>
                </pre>
              </div>
            );
          }

          if (block.type === 'table') {
            return (
              <div key={idx} className="my-5 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      {block.headers.map((h, i) => (
                        <th key={i} className="p-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 text-slate-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          if (block.type === 'unordered-list') {
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1.5 my-3 text-slate-700">
                {block.items.map((item, i) => (
                  <li key={i}>{renderPreviewInlineText(item)}</li>
                ))}
              </ul>
            );
          }

          if (block.type === 'ordered-list') {
            return (
              <ol key={idx} className="list-decimal pl-5 space-y-1.5 my-3 text-slate-700">
                {block.items.map((item, i) => (
                  <li key={i}>{renderPreviewInlineText(item)}</li>
                ))}
              </ol>
            );
          }

          if (block.type === 'image') {
            return (
              <figure key={idx} className="my-5">
                <img src={block.url} alt={block.caption || 'Article Visual'} className="rounded-xl border border-slate-200 w-full object-cover max-h-[420px]" />
                {block.caption && (
                  <figcaption className="text-center text-xs text-slate-400 font-mono mt-2">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          return (
            <p key={idx} className="my-3 text-slate-700 leading-relaxed text-sm sm:text-base">
              {renderPreviewInlineText(block.text)}
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
      return new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0);
    });

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  if (loading && blogs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800">
      
      {/* Hidden file pickers for direct upload */}
      <input
        ref={coverFileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCoverFileUpload(e.target.files[0]);
          }
        }}
      />
      <input
        ref={inlineFileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleInlineImageFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Top Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSortOption('Latest Published')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${sortOption === 'Latest Published' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortOption('Alphabetical')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${sortOption === 'Alphabetical' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              A-Z
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400 hover:text-slate-700'}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400 hover:text-slate-700'}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>

          <button onClick={fetchBlogs} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 ml-auto xl:ml-0"
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
                  <th className="px-6 py-4">Date Posted</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
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
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {b.published_at || b.created_at ? new Date(b.published_at || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {b.author_name || 'Arun Pandian P'}
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
                    <span className="text-xs font-semibold text-slate-600">{b.author_name || 'Arun Pandian P'}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      • {b.published_at || b.created_at ? new Date(b.published_at || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </span>
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

      {/* ═════════════════════════════════════════════════════════════════════════
          FULL-SCREEN MODERN PUBLICATION STUDIO (MATCHING USER REFERENCE UI)
          ═════════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden font-sans">
          
          {/* ── TOP NAVIGATION BAR ── */}
          <header className="h-16 border-b border-slate-200/90 bg-white px-4 sm:px-8 flex items-center justify-between shrink-0 relative z-30">
            
            {/* LEFT: Author Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAuthorDropdownOpen(!authorDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <img
                  src={formData.author_avatar || 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png'}
                  alt={formData.author_name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                    <span>{formData.author_name || 'Arun Pandian P'}</span>
                    <ChevronDown size={13} className="text-slate-500" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Individual article</div>
                </div>
              </button>

              {/* Author Settings Dropdown Popover */}
              {authorDropdownOpen && (
                <div className="absolute top-12 left-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 space-y-3">
                  <div className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Author Settings</div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Author Display Name</label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Avatar Photo URL</label>
                    <input
                      type="url"
                      value={formData.author_avatar}
                      onChange={(e) => setFormData({ ...formData, author_avatar: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthorDropdownOpen(false)}
                    className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* CENTER: Floating Pill Toolbar (Exactly matching user screenshot) */}
            <div className="flex items-center gap-1 bg-[#f4f2ee] sm:bg-[#f3f4f6] border border-slate-200/90 rounded-full px-2.5 py-1 shadow-2xs">
              
              {/* Style Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Style</span>
                  <ChevronDown size={13} className="text-slate-500" />
                </button>

                {/* Style Dropdown Menu */}
                {styleDropdownOpen && (
                  <div className="absolute top-10 left-0 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 text-xs font-medium space-y-0.5">
                    <button
                      type="button"
                      onClick={() => { wrapSelection('## ', '\n\n', 'Heading 2'); setStyleDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 rounded-xl flex items-center justify-between text-slate-800"
                    >
                      <span className="font-serif font-bold text-sm">Heading 1 (H1)</span>
                      <span className="text-[10px] font-mono text-slate-400">##</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { wrapSelection('### ', '\n\n', 'Subsection Title'); setStyleDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 rounded-xl flex items-center justify-between text-slate-800"
                    >
                      <span className="font-sans font-bold text-xs">Heading 2 (H2)</span>
                      <span className="text-[10px] font-mono text-slate-400">###</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { wrapSelection('#### ', '\n\n', 'Key Sub-point'); setStyleDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 rounded-xl flex items-center justify-between text-slate-800"
                    >
                      <span className="font-sans font-semibold text-xs">Heading 3 (H3)</span>
                      <span className="text-[10px] font-mono text-slate-400">####</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={() => { insertMarkdownSnippet('> [!NOTE]\n> Key analytical takeaway or observation.'); setStyleDropdownOpen(false); }}
                      className="w-full px-3 py-1.5 text-left hover:bg-blue-50 text-blue-700 rounded-xl flex items-center gap-2"
                    >
                      <Info size={13} />
                      <span>Note Alert Box</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { insertMarkdownSnippet('> [!TIP]\n> Actionable optimization tip or best practice.'); setStyleDropdownOpen(false); }}
                      className="w-full px-3 py-1.5 text-left hover:bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2"
                    >
                      <Lightbulb size={13} />
                      <span>Tip Alert Box</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { insertMarkdownSnippet('> [!WARNING]\n> Critical operational caveat or performance bottleneck.'); setStyleDropdownOpen(false); }}
                      className="w-full px-3 py-1.5 text-left hover:bg-amber-50 text-amber-700 rounded-xl flex items-center gap-2"
                    >
                      <AlertTriangle size={13} />
                      <span>Warning Alert Box</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={() => { insertMarkdownSnippet('| Dimension | Current KPI | Target KPI | Net Variance |\n|---|---|---|---|\n| Query Latency | 3.4s | 0.8s | -76% |\n| Pipeline Throughput | 82% | 98.5% | +16.5% |'); setStyleDropdownOpen(false); }}
                      className="w-full px-3 py-1.5 text-left hover:bg-slate-100 text-slate-700 rounded-xl flex items-center gap-2"
                    >
                      <Table size={13} />
                      <span>Data Table</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bold Button */}
              <button
                type="button"
                onClick={() => wrapSelection('**', '**', 'bold text')}
                title="Bold (Ctrl+B)"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                <Bold size={14} />
              </button>

              {/* Italic Button */}
              <button
                type="button"
                onClick={() => wrapSelection('*', '*', 'italic text')}
                title="Italic (Ctrl+I)"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 italic transition-colors cursor-pointer"
              >
                <Italic size={14} />
              </button>

              {/* Bullet List */}
              <button
                type="button"
                onClick={() => wrapSelection('- ', '\n', 'List item')}
                title="Bullet list"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer hidden sm:inline-flex"
              >
                <span className="font-mono text-xs font-bold leading-none">:=</span>
              </button>

              {/* Numbered List */}
              <button
                type="button"
                onClick={() => wrapSelection('1. ', '\n', 'Numbered item')}
                title="Numbered list"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer hidden sm:inline-flex"
              >
                <ListOrdered size={14} />
              </button>

              {/* Quote Button */}
              <button
                type="button"
                onClick={() => wrapSelection('> ', '\n\n', 'Notable quotation or key insight here.')}
                title="Blockquote"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 font-serif font-bold text-xs transition-colors cursor-pointer"
              >
                <Quote size={13} />
              </button>

              {/* Code Snippet Button */}
              <button
                type="button"
                onClick={() => wrapSelection('```sql\n-- SQL / Python Code\n', '\n```', 'SELECT * FROM analytics_table;')}
                title="Code block"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                <span>{`{}`}</span>
              </button>

              {/* Divider / Horizontal Rule */}
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('---')}
                title="Horizontal Divider"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 font-bold transition-colors cursor-pointer hidden sm:inline-flex"
              >
                <Minus size={14} />
              </button>

              {/* Link Button */}
              <button
                type="button"
                onClick={() => wrapSelection('[', '](https://github.com/arun-pandian-p)', 'link title')}
                title="Add link (Ctrl+K)"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
              >
                <LinkIcon size={14} />
              </button>

              {/* Embed / Code Symbol Button */}
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt('Enter Power BI or Video embed URL:');
                  if (url) {
                    insertMarkdownSnippet(`[Interactive Dashboard Embed](${url})`);
                  }
                }}
                title="Add embed snippet"
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer font-mono text-xs font-bold"
              >
                <span>{`</>`}</span>
              </button>

              {/* Image / Video Media Button with tooltip */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => inlineFileInputRef.current?.click()}
                  className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
                  title="Add image or video"
                >
                  <ImageIcon size={14} />
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                  Add image or video
                </div>
              </div>

              {/* Split / Preview Toggle */}
              <div className="h-4 w-px bg-slate-300 mx-0.5 hidden md:block" />
              <button
                type="button"
                onClick={() => setEditorViewMode(editorViewMode === 'split' ? 'write' : 'split')}
                title={editorViewMode === 'split' ? "Single Column Write Mode" : "Split Screen Live Preview"}
                className={`p-1.5 rounded-full transition-colors cursor-pointer hidden md:inline-flex ${editorViewMode === 'split' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:bg-slate-200/80'}`}
              >
                <Columns size={13} />
              </button>
              <button
                type="button"
                onClick={() => setEditorViewMode(editorViewMode === 'preview' ? 'write' : 'preview')}
                title="Reader Preview Mode"
                className={`p-1.5 rounded-full transition-colors cursor-pointer hidden md:inline-flex ${editorViewMode === 'preview' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:bg-slate-200/80'}`}
              >
                <Eye size={13} />
              </button>
            </div>

            {/* RIGHT: Notify Fans Toggle, Manage Dropdown, Publish Button, Close Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Notify Fans & Subscribers Email Toggle Button */}
              <button
                type="button"
                onClick={() => setNotifySubscribers(!notifySubscribers)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  notifySubscribers
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                title={notifySubscribers ? "⚡ Email broadcast to all fans ENABLED on Update/Publish (with cover pic, quotes & 100-129 reader score)" : "Email broadcast DISABLED"}
              >
                <Bell size={13} className={notifySubscribers ? "text-blue-600 animate-pulse" : "text-slate-400"} />
                <span className="hidden sm:inline">{notifySubscribers ? 'Notify Fans: ON' : 'Notify Fans: OFF'}</span>
                <span className="sm:hidden">Notify</span>
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                    notifySubscribers ? 'bg-blue-600 text-white' : 'bg-slate-300'
                  }`}
                >
                  {notifySubscribers && <Check size={9} strokeWidth={3} />}
                </div>
              </button>

              {/* Manage Dropdown Button */}
              <button
                type="button"
                onClick={() => setManageDrawerOpen(!manageDrawerOpen)}
                className="rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Manage</span>
                <ChevronDown size={13} className="text-slate-500" />
              </button>

              {/* Next / Publish Primary Pill Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-[#0a66c2] hover:bg-[#004182] active:scale-95 text-white font-semibold px-5 py-2 text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>{editingBlog ? 'Update' : 'Next'}</span>
                    <span className="text-white/80">→</span>
                  </>
                )}
              </button>

              {/* Close Studio Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Exit Editor"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* ── MAIN PUBLICATION CANVAS ── */}
          <main className="flex-1 overflow-y-auto bg-white flex flex-col relative">
            <div className={`max-w-4xl mx-auto w-full px-6 sm:px-12 py-8 sm:py-12 flex-1 flex flex-col ${editorViewMode === 'split' ? 'max-w-7xl' : ''}`}>

              {/* 1. COVER IMAGE AREA (Matches user reference card) */}
              <div className="mb-8">
                {formData.cover_image ? (
                  <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 shadow-xs">
                    <img
                      src={formData.cover_image}
                      alt={formData.title || 'Cover'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-bold shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Change Cover</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cover_image: '' })}
                        className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg hover:bg-red-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#f4f2ee] hover:bg-[#eae7e0] border border-dashed border-slate-300 rounded-2xl p-10 sm:p-14 text-center flex flex-col items-center justify-center transition-all cursor-pointer group">
                    
                    {/* Minimalist Landscape SVG Illustration matching user screenshot */}
                    <div className="w-20 h-16 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center mb-4 overflow-hidden relative">
                      <svg viewBox="0 0 100 80" className="w-full h-full">
                        <rect width="100" height="80" fill="#f8fafc" />
                        <circle cx="70" cy="25" r="8" fill="#FDBA74" />
                        <polygon points="10,80 45,35 65,80" fill="#94A3B8" opacity="0.6" />
                        <polygon points="40,80 70,45 95,80" fill="#64748B" opacity="0.8" />
                      </svg>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-600 mb-4">
                      Add a cover image or video to your article.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        disabled={uploadingCover}
                        className="rounded-full border border-slate-800 bg-white hover:bg-slate-900 hover:text-white px-5 py-2 text-xs font-bold text-slate-800 transition-all shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingCover ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        <span>Upload from computer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const url = window.prompt('Enter image cover URL:');
                          if (url) setFormData({ ...formData, cover_image: url });
                        }}
                        className="rounded-full border border-slate-300 bg-white hover:bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                      >
                        Paste URL
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. TITLE INPUT (Borderless, large Medium/Notion typography) */}
              <div className="mb-4">
                <input
                  ref={titleTextareaRef}
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
                  placeholder="Title"
                  className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 placeholder:text-slate-300 outline-none w-full bg-transparent border-none py-2 leading-tight"
                />
              </div>

              {/* 3. EXCERPT / SUBTITLE */}
              <div className="mb-6">
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Add a subtitle or executive excerpt (optional)..."
                  className="text-slate-500 font-sans text-base sm:text-lg placeholder:text-slate-300 outline-none w-full bg-transparent border-none py-1 leading-relaxed"
                />
              </div>

              {/* 4. EDITOR CONTENT AREA */}
              {editorViewMode === 'write' && (
                <div className="flex-1 flex flex-col">
                  <textarea
                    ref={editorTextareaRef}
                    value={formData.content}
                    onKeyDown={handleEditorKeyDown}
                    onChange={(e) => updateContentWithHistory(e.target.value)}
                    placeholder="Write here. You can also include @mentions."
                    className="font-mono sm:font-sans text-base text-slate-800 placeholder:text-slate-300 outline-none w-full bg-transparent border-none flex-1 min-h-[500px] leading-relaxed resize-y"
                  />
                </div>
              )}

              {editorViewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                  <div className="flex flex-col border-r border-slate-100 pr-4">
                    <div className="text-[11px] font-mono font-bold uppercase text-slate-400 mb-2">
                      Markdown Source Editor
                    </div>
                    <textarea
                      ref={editorTextareaRef}
                      value={formData.content}
                      onKeyDown={handleEditorKeyDown}
                      onChange={(e) => updateContentWithHistory(e.target.value)}
                      placeholder="Write here. You can also include @mentions."
                      className="font-mono text-xs text-slate-800 placeholder:text-slate-300 outline-none w-full bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex-1 min-h-[500px] leading-relaxed resize-y"
                    />
                  </div>

                  <div className="flex flex-col pl-2">
                    <div className="text-[11px] font-mono font-bold uppercase text-blue-600 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Formatted Reader Preview
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 overflow-y-auto max-h-[700px]">
                      {renderLivePreview(formData.content)}
                    </div>
                  </div>
                </div>
              )}

              {editorViewMode === 'preview' && (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  {renderLivePreview(formData.content)}
                </div>
              )}

            </div>
          </main>

          {/* ── FLOATING BOTTOM-RIGHT STATUS PILL (Matching user reference) ── */}
          <div className="fixed bottom-6 right-6 z-30 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-full px-4 py-2 text-xs font-mono text-slate-600 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${formData.published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="font-semibold text-slate-800">{formData.published ? 'Published' : 'Draft'}</span>
              <span className="text-slate-300">•</span>
              <span>{wordCount} words</span>
              <span className="text-slate-300">•</span>
              <span>{estimatedReadTime}</span>
            </div>
          </div>

          {/* ── SLIDE-OVER MANAGE DRAWER ── */}
          {manageDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-2xs transition-opacity"
                onClick={() => setManageDrawerOpen(false)}
              />
              <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden z-10 animate-in slide-in-from-right duration-200">
                
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">Article Publishing Settings</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManageDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Drawer Tabs */}
                <div className="flex border-b border-slate-100 px-4 text-xs font-semibold bg-white">
                  {[
                    { id: 'general', label: 'General & Date' },
                    { id: 'seo', label: 'SEO & Social' },
                    { id: 'embeds', label: 'Links & DAX' },
                    { id: 'templates', label: 'Templates' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setManageTab(tab.id)}
                      className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                        manageTab === tab.id
                          ? 'border-blue-600 text-blue-600 font-bold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                  
                  {/* TAB: GENERAL */}
                  {manageTab === 'general' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Date Posted *</label>
                        <input
                          type="date"
                          value={formData.published_at}
                          onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">URL Slug *</label>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Primary Category</label>
                          <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                            placeholder="Data Analytics"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Reading Time</label>
                          <input
                            type="text"
                            value={formData.read_time}
                            onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tags (Comma-separated)</label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                          placeholder="Power BI, SQL, Statistics, DAX"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Sort Order</label>
                        <input
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-950 text-xs">
                          <input
                            type="checkbox"
                            checked={notifySubscribers}
                            onChange={(e) => setNotifySubscribers(e.target.checked)}
                            className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>⚡ Broadcast Email to All Fans &amp; Subscribers</span>
                        </label>
                        <p className="text-[11px] text-blue-800/80 pl-6 leading-relaxed">
                          Dispatches an instant email with your cover image, personal greeting, custom story, and verified unsubscribe footer from <code>updates@arunpandian.online</code>.
                        </p>

                        {notifySubscribers && (
                          <div className="pt-2 pl-6 space-y-3 border-t border-blue-200/60">
                            <div>
                              <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                                Custom Email Subject (Optional)
                              </label>
                              <input
                                type="text"
                                value={customMailSubject}
                                onChange={(e) => setCustomMailSubject(e.target.value)}
                                placeholder={`e.g. New Case Study: ${formData.title || 'Data Architecture'}`}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-xs text-slate-900 focus:border-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                                Custom Email Story / Message (Optional)
                              </label>
                              <textarea
                                rows={3}
                                value={customMailMessage}
                                onChange={(e) => setCustomMailMessage(e.target.value)}
                                placeholder="Hey! Just published a breakdown of the new SQL pipeline and latency benchmarks..."
                                className="w-full px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-xs text-slate-900 focus:border-blue-500 outline-none leading-relaxed"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                                CTA Button Text (Optional)
                              </label>
                              <input
                                type="text"
                                value={customMailCta}
                                onChange={(e) => setCustomMailCta(e.target.value)}
                                placeholder="e.g. Read Complete Case Study ➔"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-xs text-slate-900 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>Publish publicly to live site</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>Pin as Featured Article</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={formData.allow_comments !== false}
                            onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>Allow Reader Comments (Auto-cleared after 15 days)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB: SEO */}
                  {manageTab === 'seo' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">SEO Meta Title</label>
                        <input
                          type="text"
                          value={formData.seo_title}
                          onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
                          placeholder={formData.title || 'Custom SEO Page Title'}
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">SEO Meta Description</label>
                        <textarea
                          rows={3}
                          value={formData.seo_description}
                          onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
                          placeholder={formData.excerpt || 'Search engine summary...'}
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Social Preview Image URL</label>
                        <input
                          type="url"
                          value={formData.social_image}
                          onChange={(e) => setFormData({ ...formData, social_image: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none font-mono"
                          placeholder={formData.cover_image || 'https://...'}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                          Google Search Result Preview:
                        </span>
                        <div className="text-[11px] text-blue-800 font-mono truncate">
                          https://arunpandian.online/blog/{formData.slug || 'article-slug'}
                        </div>
                        <div className="text-xs font-semibold text-blue-700 truncate">
                          {formData.seo_title || formData.title || 'Article Title'}
                        </div>
                        <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {formData.seo_description || formData.excerpt || 'Article summary preview...'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: EMBEDS */}
                  {manageTab === 'embeds' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">GitHub Repository Link</label>
                        <input
                          type="url"
                          value={formData.github_link}
                          onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                          placeholder="https://github.com/arun-pandian-p/..."
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Live Project / Demo Link</label>
                        <input
                          type="url"
                          value={formData.live_link}
                          onChange={(e) => setFormData({ ...formData, live_link: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Power BI Dashboard Embed URL</label>
                        <input
                          type="url"
                          value={formData.powerbi_url}
                          onChange={(e) => setFormData({ ...formData, powerbi_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                          placeholder="https://app.powerbi.com/view?r=..."
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">YouTube Walkthrough Video URL</label>
                        <input
                          type="url"
                          value={formData.video_url}
                          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB: TEMPLATES */}
                  {manageTab === 'templates' && (
                    <div className="space-y-3">
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Apply standard structure templates tailored for data analytics and engineering articles.
                      </p>
                      <button
                        type="button"
                        onClick={() => applyTemplate('medallion-architecture')}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="font-bold text-slate-800">🏗️ Medallion Lakehouse Architecture</span>
                        <span className="text-[11px] text-slate-500">Bronze, Silver, Gold ETL pipeline with sample SQL and Python transformation code.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTemplate('case-study')}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="font-bold text-slate-800">📊 Technical Analytics Case Study</span>
                        <span className="text-[11px] text-slate-500">Executive problem statement, hypothesis, statistical DAX KPIs, and business impact.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTemplate('powerbi-tutorial')}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="font-bold text-slate-800">⚡ Power BI & Dynamic DAX Walkthrough</span>
                        <span className="text-[11px] text-slate-500">Star-schema modeling best practices and rolling average DAX measures.</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  {editingBlog && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(editingBlog)}
                      className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Delete Post
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setManageDrawerOpen(false)}
                    className="ml-auto px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

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
