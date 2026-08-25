import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  FolderOpen, PenTool, Briefcase, Mail, Loader2, ArrowUp, ArrowDown,
  TrendingUp, BarChart2, HardDrive, Eye, Calendar, Clock, CheckCircle2,
  ExternalLink, Edit2, ShieldCheck, Activity, Users, ArrowUpRight,
  Database, RefreshCw, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, blogs: 0, experiences: 0, messages: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        { count: pCount, data: pData },
        { count: bCount, data: bData },
        { count: eCount },
        { count: mCount, data: mData }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact' }).order('sort_order', { ascending: true }).limit(4),
        supabase.from('blogs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(4),
        supabase.from('experiences').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(4),
      ]);

      setStats({
        projects: pCount || 0,
        blogs: bCount || 0,
        experiences: eCount || 0,
        messages: mCount || 0,
      });

      if (pData) setRecentProjects(pData);
      if (bData) setRecentBlogs(bData);
      if (mData) setRecentMessages(mData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.success('Dashboard metrics updated!', { icon: '🔄' });
  };

  // Top KPI Metric Cards
  const cards = [
    { title: 'TOTAL PROJECTS', value: stats.projects, icon: FolderOpen, link: '/admin/projects', color: 'text-blue-600', bg: 'bg-blue-50', trend: '12%', spark: [30, 45, 20, 60, 75, 50, 90, 100] },
    { title: 'PUBLISHED BLOGS', value: stats.blogs, icon: PenTool, link: '/admin/blogs', color: 'text-purple-600', bg: 'bg-purple-50', trend: '8%', spark: [25, 35, 40, 55, 60, 70, 85, 95] },
    { title: 'EXPERIENCES', value: stats.experiences, icon: Briefcase, link: '/admin/experiences', color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '15%', spark: [40, 45, 50, 65, 70, 80, 85, 90] },
    { title: 'CONTACT MESSAGES', value: stats.messages, icon: Mail, link: '/admin/inbox', color: 'text-orange-600', bg: 'bg-orange-50', trend: '22%', spark: [20, 30, 45, 60, 50, 75, 90, 100] },
  ];

  // Simulated Analytics Traffic Data for Line Chart
  const trafficData = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      views: [180, 240, 310, 290, 420, 380, 510],
      unique: [120, 160, 210, 190, 280, 250, 340],
      totalViews: '2,330',
      uniqueVisitors: '1,550',
      avgDuration: '3m 15s',
      bounceRate: '21.4%'
    },
    '30d': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      views: [850, 1120, 1340, 1680],
      unique: [560, 780, 920, 1140],
      totalViews: '4,990',
      uniqueVisitors: '3,400',
      avgDuration: '3m 42s',
      bounceRate: '19.8%'
    },
    '90d': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      views: [3200, 4600, 6100],
      unique: [2100, 3100, 4200],
      totalViews: '13,900',
      uniqueVisitors: '9,400',
      avgDuration: '4m 05s',
      bounceRate: '18.2%'
    }
  };

  const activeTraffic = trafficData[timeRange] || trafficData['30d'];

  // Skills Distribution Bar Chart Data
  const skillDistribution = [
    { skill: 'Power BI & DAX Modeling', projects: 4, percentage: 100, color: 'bg-amber-500' },
    { skill: 'SQL & Database Design', projects: 4, percentage: 100, color: 'bg-blue-600' },
    { skill: 'Python (Pandas, NumPy, EDA)', projects: 3, percentage: 75, color: 'bg-emerald-500' },
    { skill: 'Advanced Excel & Power Query', projects: 3, percentage: 75, color: 'bg-teal-500' },
    { skill: 'ETL Pipelines & Automation', projects: 2, percentage: 50, color: 'bg-indigo-600' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={26} />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-800 font-sans">
      
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Key Metrics Overview</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time analytics, portfolio health & inbound communication channels
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleManualRefresh}
            title="Refresh metrics from Supabase"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 01: TOP 4 METRIC KPI CARDS ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              to={c.link}
              className="block bg-white rounded-[1.25rem] p-6 border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-1.5">{c.title}</p>
                  <h2 className="text-3xl font-black text-slate-900">{c.value}</h2>
                  
                  <div className="flex items-center gap-1 mt-2.5">
                    <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      <ArrowUp size={11} strokeWidth={3} className="mr-0.5" />
                      {c.trend}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
                  </div>
                </div>
                
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${c.bg} ${c.color} group-hover:scale-105 transition-transform`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
              </div>

              {/* Dynamic Sparkline Bars */}
              <div className="flex items-end gap-1.5 mt-5 h-7 opacity-50 group-hover:opacity-80 transition-opacity">
                {c.spark.map((h, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-blue-300 rounded-t-xs transition-all duration-300 group-hover:bg-blue-500" 
                    style={{ height: `${h}%` }} 
                  />
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── 02: TRAFFIC ANALYTICS (LINE CHART) & SKILLS BREAKDOWN (BAR CHART) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visitor Traffic & Portfolio Views Line Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-[1.25rem] border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" />
                Portfolio Traffic & Profile Engagement
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Total Views: <strong className="text-slate-800">{activeTraffic.totalViews}</strong> | Unique Visitors: <strong className="text-slate-800">{activeTraffic.uniqueVisitors}</strong>
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600">Page Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                <span className="text-slate-600">Unique Visitors</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-48 sm:h-56 w-full relative pt-4">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="uniqueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#E2E8F0" strokeWidth="1" />

              {/* Views Area & Line */}
              <path
                d="M 0,120 Q 80,70 160,85 T 320,40 T 500,20 L 500,150 L 0,150 Z"
                fill="url(#viewsGradient)"
              />
              <path
                d="M 0,120 Q 80,70 160,85 T 320,40 T 500,20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Unique Visitors Area & Line */}
              <path
                d="M 0,140 Q 80,105 160,115 T 320,80 T 500,55 L 500,150 L 0,150 Z"
                fill="url(#uniqueGradient)"
              />
              <path
                d="M 0,140 Q 80,105 160,115 T 320,80 T 500,55"
                fill="none"
                stroke="#14B8A6"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="160" cy="85" r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="320" cy="40" r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="500" cy="20" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
              {activeTraffic.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Avg Session</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{activeTraffic.avgDuration}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Bounce Rate</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{activeTraffic.bounceRate}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Resume DL Rate</span>
              <span className="text-sm font-bold text-emerald-600 font-mono">34.2%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Conversion Rate</span>
              <span className="text-sm font-bold text-blue-600 font-mono">8.5%</span>
            </div>
          </div>
        </div>

        {/* Technical Stack & Domain Distribution Bar Chart */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-[1.25rem] border border-slate-200/90 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <BarChart2 size={18} className="text-amber-500" />
              Project Stack Distribution
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Coverage across published case studies
            </p>
          </div>

          <div className="space-y-4">
            {skillDistribution.map((item) => (
              <div key={item.skill} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 truncate">{item.skill}</span>
                  <span className="font-mono text-slate-500 text-[11px]">{item.projects} projects</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-center gap-2.5">
            <Sparkles size={16} className="text-amber-600 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              100% of projects feature end-to-end SQL transformation and Power BI visualization.
            </span>
          </div>
        </div>
      </div>

      {/* ── 03: RECENT INBOX MESSAGES & STORAGE/SYSTEM HEALTH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Contact Messages Inbox Widget */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-[1.25rem] border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Mail size={18} className="text-orange-500" />
                Recent Inquiries & Contact Messages
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {stats.messages} total messages received
              </p>
            </div>
            <Link
              to="/admin/inbox"
              className="text-xs font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentMessages.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No new contact messages in the inbox.
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-lg px-2">
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{msg.name || 'Anonymous Recruiter'}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {msg.email}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate max-w-md font-sans">
                      {msg.message || 'Interested in discussing data analytics opportunity...'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(msg.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Storage, Database & Cloud System Health Widget */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-[1.25rem] border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <HardDrive size={18} className="text-indigo-600" />
                Storage & Infrastructure Health
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Supabase PostgreSQL + Edge CDN
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold border border-emerald-200 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Healthy
            </span>
          </div>

          {/* Storage Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Storage Used</span>
              <span className="font-mono text-slate-500 text-[11px]">28.4 MB / 1.0 GB (2.8%)</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: '1.8%' }} className="bg-blue-600 h-full" title="Images (18 MB)" />
              <div style={{ width: '0.6%' }} className="bg-amber-500 h-full" title="Dashboards & Code (6 MB)" />
              <div style={{ width: '0.4%' }} className="bg-purple-500 h-full" title="PDFs (4.4 MB)" />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>🔵 Images: 18.0 MB</span>
              <span>🟡 Datasets: 6.0 MB</span>
              <span>🟣 PDFs: 4.4 MB</span>
            </div>
          </div>

          {/* System Services Status List */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 flex items-center gap-2">
                <Database size={14} className="text-blue-600" />
                Supabase PostgreSQL
              </span>
              <span className="font-mono text-[11px] text-emerald-600 font-bold">Online (22ms)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 flex items-center gap-2">
                <Activity size={14} className="text-emerald-600" />
                Vercel Web Analytics
              </span>
              <span className="font-mono text-[11px] text-emerald-600 font-bold">Connected</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-600" />
                GitHub Repository Sync
              </span>
              <a
                href="https://github.com/arun-pandian-p"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
              >
                <span>arun-pandian-p</span>
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 04: RECENT CONTENT OVERVIEW & QUICK ACTIONS ── */}
      <div className="bg-white p-6 sm:p-7 rounded-[1.25rem] border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recently Updated Case Studies & Publications</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Live status and quick editing shortcuts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/projects"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              All Projects ({stats.projects})
            </Link>
            <Link
              to="/admin/blogs"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              All Blogs ({stats.blogs})
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {recentProjects.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h4 className="font-bold text-sm text-slate-900 truncate">{p.title}</h4>
                </div>
                <span className="text-xs font-mono text-slate-500 block mt-0.5">Order #{p.sort_order || 1} • Project</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to={`/project/${p.id}`}
                  target="_blank"
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 text-xs shadow-2xs"
                  title="View Live"
                >
                  <Eye size={14} />
                </Link>
                <Link
                  to={`/admin/projects?edit=${p.id}`}
                  className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 text-xs shadow-2xs"
                  title="Edit in Admin"
                >
                  <Edit2 size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
