import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { Loader2, ArrowLeft, ExternalLink, Database, Target, Brain, LineChart } from 'lucide-react';

const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { useContent } from '../context/ContentProvider';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useContent();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        if (data) setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-ink w-8 h-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-ink">
        <h1 className="text-3xl font-display font-bold mb-4">Project Not Found</h1>
        <Link to="/" className="text-accent hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  // Schema generation
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": project.title,
    "description": project.insight || project.problem || `Data analysis project: ${project.title}`,
    "programmingLanguage": project.tags?.join(", "),
    "author": {
      "@type": "Person",
      "name": "Arun Pandian"
    },
    "datePublished": project.created_at,
    "image": project.image_url || settings?.branding?.logoUrl
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://arunpandian.online/" },
      { "@type": "ListItem", "position": 2, "name": "Projects", "item": "https://arunpandian.online/#projects" },
      { "@type": "ListItem", "position": 3, "name": project.title, "item": `https://arunpandian.online/project/${project.id}` }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent selection:text-white">
      <Helmet>
        <title>{project.title} | Data Analyst Portfolio - Arun Pandian</title>
        <meta name="description" content={project.insight || `Detailed case study on ${project.title}. Read how Arun Pandian used data analytics to solve this business problem.`} />
        <meta property="og:title" content={`${project.title} | Data Analytics Case Study`} />
        <meta property="og:description" content={project.insight || project.problem || "A detailed data analysis project."} />
        {project.image_url && <meta property="og:image" content={project.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-6 sm:px-12 max-w-5xl mx-auto w-full">
        <Link to="/#projects" className="inline-flex items-center gap-2 text-ink-soft hover:text-ink transition-colors mb-8 font-mono text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <article>
        {/* Header */}
        <header className="mb-12 md:mb-16">
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags?.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full border border-line bg-surface text-ink-soft text-xs font-bold uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black leading-tight mb-6">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 border-b border-line pb-8">
            {project.live_link && (
              <a href={project.live_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-ink text-bg px-5 py-2.5 rounded-xl font-medium hover:scale-105 transition-transform">
                <ExternalLink size={18} /> View Live Dashboard
              </a>
            )}
            {project.github_link && (
              <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line bg-surface px-5 py-2.5 rounded-xl font-medium hover:border-ink transition-colors">
                <GithubIcon size={18} /> View Source Code
              </a>
            )}
          </div>
        </header>

        {/* Hero Image */}
        {project.image_url && (
          <div className="w-full h-[400px] md:h-[500px] mb-16 rounded-3xl overflow-hidden bg-muted border border-line">
            <img fetchpriority="high" src={project.image_url} alt={`${project.title} dashboard visualization`} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Case Study Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Main sections */}
          <div className="md:col-span-8 space-y-12">
            
            {project.problem && (
              <section>
                <div className="flex items-center gap-3 mb-4 text-accent">
                  <Target size={24} />
                  <h2 className="text-2xl font-display font-bold text-ink">Business Problem</h2>
                </div>
                <div className="prose prose-lg text-ink-soft max-w-none">
                  <p>{project.problem}</p>
                </div>
              </section>
            )}

            {project.data && (
              <section>
                <div className="flex items-center gap-3 mb-4 text-amber-500">
                  <Database size={24} />
                  <h2 className="text-2xl font-display font-bold text-ink">The Dataset</h2>
                </div>
                <div className="prose prose-lg text-ink-soft max-w-none">
                  <p>{project.data}</p>
                </div>
              </section>
            )}

            {project.process && (
              <section>
                <div className="flex items-center gap-3 mb-4 text-blue-500">
                  <Brain size={24} />
                  <h2 className="text-2xl font-display font-bold text-ink">Methodology & Process</h2>
                </div>
                <div className="prose prose-lg text-ink-soft max-w-none whitespace-pre-wrap">
                  <p>{project.process}</p>
                </div>
              </section>
            )}

            {project.insight && (
              <section>
                <div className="flex items-center gap-3 mb-4 text-emerald-500">
                  <LineChart size={24} />
                  <h2 className="text-2xl font-display font-bold text-ink">Key Insights & Impact</h2>
                </div>
                <div className="p-6 md:p-8 rounded-2xl bg-surface border border-line">
                  <p className="text-lg leading-relaxed text-ink font-medium italic">
                    "{project.insight}"
                  </p>
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-8">
            <div className="p-6 rounded-2xl bg-surface border border-line sticky top-32">
              <h3 className="font-bold text-lg mb-4 border-b border-line pb-4">Project Overview</h3>
              <ul className="space-y-4">
                <li>
                  <span className="block text-xs font-mono text-ink-soft uppercase tracking-widest mb-1">Role</span>
                  <span className="font-medium">Data Analyst</span>
                </li>
                <li>
                  <span className="block text-xs font-mono text-ink-soft uppercase tracking-widest mb-1">Date</span>
                  <span className="font-medium">{new Date(project.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                </li>
                <li>
                  <span className="block text-xs font-mono text-ink-soft uppercase tracking-widest mb-1">Tech Stack</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags?.map(t => (
                      <span key={t} className="px-2 py-1 bg-muted rounded-md text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
        </article>

      </main>
    </div>
  );
};

export default ProjectDetails;
