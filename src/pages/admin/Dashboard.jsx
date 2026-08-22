import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FolderOpen, PenTool, Briefcase, Mail, Loader2, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, blogs: 0, experiences: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: 'TOTAL PROJECTS', value: stats.projects, icon: FolderOpen, link: '/admin/projects', color: 'text-blue-500', bg: 'bg-blue-50', trend: '12%' },
    { title: 'PUBLISHED BLOGS', value: stats.blogs, icon: PenTool, link: '/admin/blogs', color: 'text-purple-500', bg: 'bg-purple-50', trend: '8%' },
    { title: 'EXPERIENCES', value: stats.experiences, icon: Briefcase, link: '/admin/experiences', color: 'text-indigo-500', bg: 'bg-indigo-50', trend: '15%' },
    { title: 'CONTACT MESSAGES', value: stats.messages, icon: Mail, link: '/admin/inbox', color: 'text-orange-500', bg: 'bg-orange-50', trend: '22%' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      <h3 className="font-bold text-lg">Key Metrics Overview</h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              to={c.link}
              className="block bg-white rounded-[1.25rem] p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] transition-shadow relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">{c.title}</p>
                  <h2 className="text-4xl font-extrabold text-slate-800">{c.value}</h2>
                  
                  <div className="flex items-center gap-1 mt-3">
                    <span className="flex items-center text-emerald-500 text-xs font-bold">
                      <ArrowUp size={12} strokeWidth={3} className="mr-0.5" />
                      {c.trend}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">vs last month</span>
                  </div>
                </div>
                
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.bg} ${c.color}`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
              </div>

              {/* Decorative sparkline bars imitating the screenshot */}
              <div className="flex items-end gap-1 mt-6 h-8 opacity-40">
                <div className="w-full bg-teal-200 rounded-t-sm h-[30%]" />
                <div className="w-full bg-teal-200 rounded-t-sm h-[45%]" />
                <div className="w-full bg-teal-200 rounded-t-sm h-[20%]" />
                <div className="w-full bg-teal-200 rounded-t-sm h-[60%]" />
                <div className="w-full bg-teal-200 rounded-t-sm h-[75%]" />
                <div className="w-full bg-teal-200 rounded-t-sm h-[50%]" />
                <div className="w-full bg-teal-200 rounded-t-sm h-[90%]" />
                <div className="w-full bg-teal-200 rounded-t-sm h-[100%]" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
