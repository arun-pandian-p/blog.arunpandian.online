import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  FolderOpen, PenTool, Briefcase, Mail, Loader2, ArrowUp, ArrowDown,
  TrendingUp, BarChart2, HardDrive, Eye, Calendar, Clock, CheckCircle2,
  ExternalLink, Edit2, ShieldCheck, Activity, Users, ArrowUpRight,
  Database, RefreshCw, Sparkles, Filter, ChevronDown, Plus, Search,
  Bell, Share2, Printer, Download, CheckSquare, Square
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const context = useOutletContext();
  const isDark = context?.isDark || false;

  const [stats, setStats] = useState({ projects: 0, blogs: 0, experiences: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // Interactive Checklist State
  const [todos, setTodos] = useState([
    { id: 1, text: 'Review Amazon Delivery Performance & Prediction Dashboard', date: '24 Aug 2026', tag: 'Due tomorrow', tagColor: 'bg-amber-100 text-amber-800 border-amber-200', done: false },
    { id: 2, text: 'Publish Data Science Job Market Analysis Case Study', date: '23 Aug 2026', tag: 'Done', tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', done: true },
    { id: 3, text: 'Validate AI Email Summarizer Pipeline on Local Ollama LLM', date: '23 Aug 2026', tag: 'Done', tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', done: true },
    { id: 4, text: 'Update Data Jobs Salary Benchmark Power BI Visuals', date: '22 Aug 2026', tag: 'In review', tagColor: 'bg-blue-100 text-blue-800 border-blue-200', done: false },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        { count: pCount },
        { count: bCount },
        { count: eCount },
        { count: mCount }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }),
        supabase.from('experiences').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        projects: pCount || 0,
        blogs: bCount || 0,
        experiences: eCount || 0,
        messages: mCount || 0,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    toast.success('Task status updated!', { icon: '✓' });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-[#F29F67]" size={28} />
      </div>
    );
  }

  return (
    <div className={`space-y-6 max-w-[1600px] mx-auto font-sans transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* ── 01: TOP GREETING & ACTION CONTROLS (Matching StarAdmin Top Bar) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#1E1E2C]'}`}>
            Good Morning, <span className="text-[#F29F67]">Arun Pandian</span>
          </h1>
          <p className={`text-xs sm:text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Your portfolio performance summary this week
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`appearance-none pl-3 pr-8 py-2 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                isDark ? 'bg-[#1E1E2C] border-[#2E2E42] text-slate-200' : 'bg-white border-[#E2E6EE] text-slate-700'
              }`}
            >
              <option>Select Category</option>
              <option>Power BI Dashboards</option>
              <option>SQL Data Modeling</option>
              <option>Python EDA</option>
              <option>Machine Learning</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Date Picker Button */}
          <button
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
              isDark ? 'bg-[#1E1E2C] border-[#2E2E42] text-slate-300' : 'bg-white border-[#E2E6EE] text-slate-700'
            }`}
          >
            <Calendar size={14} className="text-[#F29F67]" />
            <span>01 Jan 2026 - 30 Dec 2026</span>
          </button>

          {/* Quick Search */}
          <button className={`p-2 rounded-xl border ${isDark ? 'bg-[#1E1E2C] border-[#2E2E42] text-slate-300' : 'bg-white border-[#E2E6EE] text-slate-600'}`}>
            <Search size={14} />
          </button>

          {/* Notifications */}
          <button className={`relative p-2 rounded-xl border ${isDark ? 'bg-[#1E1E2C] border-[#2E2E42] text-slate-300' : 'bg-white border-[#E2E6EE] text-slate-600'}`}>
            <Bell size={14} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F29F67] ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* ── 02: TAB BAR & SHARE/EXPORT ACTIONS ── */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-[#28283C]' : 'border-[#E8ECF2]'}`}>
        <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold">
          {['Overview', 'Audiences', 'Demographics', 'More'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-[#F29F67] text-[#F29F67] font-bold'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin);
              toast.success('Portfolio URL copied!');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark ? 'bg-[#1E1E2C] border-[#2E2E42] text-slate-300 hover:bg-[#28283C]' : 'bg-white border-[#E2E6EE] text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={() => window.print()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark ? 'bg-[#1E1E2C] border-[#2E2E42] text-slate-300 hover:bg-[#28283C]' : 'bg-white border-[#E2E6EE] text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
          <button
            onClick={() => toast.success('Analytics report generated!')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E1E2C] text-white hover:bg-[#28283C] text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── 03: TOP KPI METRICS ROW (Matching StarAdmin Cards) ── */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-5 rounded-2xl border ${
        isDark ? 'bg-[#1E1E2C] border-[#2A2A3E]' : 'bg-white border-[#E8ECF2] shadow-xs'
      }`}>
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bounce Rate</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">32.53%</div>
          <span className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5">
            ▼ -0.5%
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Page Views</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">7,682</div>
          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5">
            ▲ +0.1%
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">New Sessions</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">68.8</div>
          <span className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5">
            ▼ -2.1%
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Time on Site</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">2m:35s</div>
          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5">
            ▲ +0.8%
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Projects</span>
          <div className="text-xl sm:text-2xl font-black text-[#F29F67]">{stats.projects} Active</div>
          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5">
            ▲ +12%
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Contact Leads</span>
          <div className="text-xl sm:text-2xl font-black text-[#34B1AA]">{stats.messages} Inbound</div>
          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5">
            ▲ +22%
          </span>
        </div>
      </div>

      {/* ── 04: ROW 1: PERFORMANCE LINE CHART + STATUS SUMMARY CARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Performance Line Chart (Left 8 Cols) */}
        <div className={`lg:col-span-8 p-6 sm:p-7 rounded-2xl border space-y-4 ${
          isDark ? 'bg-[#1E1E2C] border-[#2A2A3E]' : 'bg-white border-[#E8ECF2] shadow-xs'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-[#1E1E2C]'}`}>
                Performance Line Chart
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Portfolio & Dashboard Engagement for Analytics Team
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F29F67]" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>This week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1E1E2C] dark:bg-slate-400" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Last week</span>
              </div>
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart in #F29F67 & #1E1E2C */}
          <div className="h-56 sm:h-64 w-full relative pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="coralAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F29F67" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#F29F67" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke={isDark ? '#2C2C40' : '#F1F5F9'} strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke={isDark ? '#2C2C40' : '#F1F5F9'} strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke={isDark ? '#2C2C40' : '#F1F5F9'} strokeWidth="1" />
              <line x1="0" y1="165" x2="500" y2="165" stroke={isDark ? '#3C3C54' : '#E2E8F0'} strokeWidth="1" />

              {/* Coral Area Fill & Smooth Curve */}
              <path
                d="M 0,140 Q 60,110 120,80 T 240,65 T 360,110 T 500,55 L 500,165 L 0,165 Z"
                fill="url(#coralAreaGrad)"
              />
              <path
                d="M 0,140 Q 60,110 120,80 T 240,65 T 360,110 T 500,55"
                fill="none"
                stroke="#F29F67"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Charcoal Last Week Comparison Line */}
              <path
                d="M 0,155 Q 60,135 120,110 T 240,115 T 360,80 T 500,90"
                fill="none"
                stroke={isDark ? '#94A3B8' : '#1E1E2C'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="120" cy="80" r="4.5" fill="#F29F67" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="240" cy="65" r="4.5" fill="#F29F67" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="360" cy="110" r="4.5" fill="#F29F67" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="500" cy="55" r="5" fill="#F29F67" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* X-Axis Days */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Status Summary & Circular Donut Meters */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* Status Summary Card in Deep Navy #1E1E2C with Glowing Teal #34B1AA Wave */}
          <div className="p-6 rounded-2xl bg-[#1E1E2C] text-white border border-[#2E2E44] shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Status Summary</span>
              <span className="h-2 w-2 rounded-full bg-[#34B1AA] animate-pulse" />
            </div>

            <div className="flex items-end justify-between pt-2">
              <div>
                <span className="text-[11px] text-slate-400 block font-mono">Closed Value / Leads</span>
                <span className="text-4xl font-black text-[#34B1AA] tracking-tight">357</span>
              </div>

              {/* Glowing Teal SVG Wave */}
              <div className="w-32 h-14">
                <svg viewBox="0 0 120 50" className="w-full h-full">
                  <path
                    d="M 0,35 Q 30,10 60,35 T 120,15"
                    fill="none"
                    stroke="#34B1AA"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Dual Donut / Circular Visitor Meters */}
          <div className={`p-6 rounded-2xl border grid grid-cols-2 gap-4 ${
            isDark ? 'bg-[#1E1E2C] border-[#2A2A3E]' : 'bg-white border-[#E8ECF2] shadow-xs'
          }`}>
            {/* Total Visitors Donut */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDark ? '#2C2C40' : '#E2E8F0'}
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B8FF3"
                    strokeDasharray="26.8, 100"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total visitors</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">26.80%</span>
              </div>
            </div>

            {/* Visits Per Day Donut */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDark ? '#2C2C40' : '#E2E8F0'}
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#34B1AA"
                    strokeDasharray="75, 100"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Visits Per Day</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">9,065</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 05: ROW 2: MARKET OVERVIEW BAR CHART + TO-DO REMINDERS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Market Overview Monthly Stacked Bar Chart */}
        <div className={`lg:col-span-8 p-6 sm:p-7 rounded-2xl border space-y-4 ${
          isDark ? 'bg-[#1E1E2C] border-[#2A2A3E]' : 'bg-white border-[#E8ECF2] shadow-xs'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-[#1E1E2C]'}`}>
                Market & Analytics Overview
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  $36,2531.00 <span className="text-xs font-semibold text-slate-400">USD</span>
                </span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                  (+1.37%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1E1E2C] dark:bg-slate-300" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>This week</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F29F67]" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Last week</span>
                </div>
              </div>

              <select className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none ${
                isDark ? 'bg-[#181824] border-[#2E2E42] text-slate-300' : 'bg-slate-100 border-[#E2E6EE] text-slate-700'
              }`}>
                <option>This month</option>
                <option>Last 6 months</option>
                <option>This year</option>
              </select>
            </div>
          </div>

          {/* Monthly Stacked Bars */}
          <div className="h-48 sm:h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {[
              { month: 'JAN', val1: 45, val2: 25 },
              { month: 'FEB', val1: 65, val2: 20 },
              { month: 'MAR', val1: 50, val2: 15 },
              { month: 'APR', val1: 75, val2: 20 },
              { month: 'MAY', val1: 55, val2: 25 },
              { month: 'JUN', val1: 40, val2: 35 },
              { month: 'JUL', val1: 70, val2: 20 },
              { month: 'AUG', val1: 50, val2: 25 },
              { month: 'SEP', val1: 60, val2: 15 },
              { month: 'OCT', val1: 55, val2: 20 },
              { month: 'NOV', val1: 45, val2: 20 },
              { month: 'DEC', val1: 80, val2: 15 },
            ].map((col) => (
              <div key={col.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full max-w-[20px] flex flex-col justify-end gap-1 h-full">
                  <div
                    style={{ height: `${col.val2}%` }}
                    className={`w-full rounded-t-xs transition-all ${isDark ? 'bg-slate-300' : 'bg-[#1E1E2C]'}`}
                  />
                  <div
                    style={{ height: `${col.val1}%` }}
                    className="w-full bg-[#F29F67] rounded-b-xs transition-all"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{col.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* To-Do / Reminders Card */}
        <div className={`lg:col-span-4 p-6 sm:p-7 rounded-2xl border space-y-4 flex flex-col justify-between ${
          isDark ? 'bg-[#1E1E2C] border-[#2A2A3E]' : 'bg-white border-[#E8ECF2] shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-[#1E1E2C]'}`}>
              To-Do / Reminders
            </h3>
            <button
              onClick={() => toast.success('New task added!')}
              className="p-1 rounded-full bg-[#1E1E2C] text-white hover:bg-[#28283C] cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Task Items */}
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  todo.done
                    ? isDark ? 'bg-[#181824]/50 border-slate-800 opacity-60' : 'bg-slate-50/70 border-slate-100 opacity-60'
                    : isDark ? 'bg-[#222234] border-[#2E2E44]' : 'bg-white border-slate-200'
                }`}
              >
                <button className="mt-0.5 text-slate-400 hover:text-[#F29F67]">
                  {todo.done ? <CheckCircle2 size={16} className="text-[#34B1AA]" /> : <Square size={16} />}
                </button>

                <div className="space-y-1 flex-1">
                  <p className={`text-xs font-semibold leading-snug ${todo.done ? 'line-through text-slate-400' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {todo.text}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-slate-400">{todo.date}</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold border ${todo.tagColor}`}>
                      {todo.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <span className="text-xs text-slate-400 font-mono">
              All pipeline workflows synced with PostgreSQL
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
