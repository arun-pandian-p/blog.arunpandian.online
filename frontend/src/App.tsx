import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';

import { HomePage } from './pages/HomePage';
import { StoryDetailPage } from './pages/StoryDetailPage';
import { EditorPage } from './pages/EditorPage';
import { AuthorPage } from './pages/AuthorPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };

    // Intercept internal link clicks for instant client SPA navigation
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.hasAttribute('target') &&
        !target.hasAttribute('download')
      ) {
        e.preventDefault();
        const path = target.pathname + target.search;
        window.history.pushState({}, '', path);
        setCurrentPath(target.pathname);
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  const renderCurrentPage = () => {
    // Route: /story/:slug
    if (currentPath.startsWith('/story/')) {
      const slug = currentPath.replace('/story/', '').replace(/\/$/, '');
      return <StoryDetailPage slug={slug} />;
    }

    // Route: /edit/:id
    if (currentPath.startsWith('/edit/')) {
      const id = currentPath.replace('/edit/', '').replace(/\/$/, '');
      return <EditorPage editStoryId={id} />;
    }

    // Route: /new
    if (currentPath === '/new' || currentPath === '/new/') {
      return <EditorPage />;
    }

    // Route: /author/:username
    if (currentPath.startsWith('/author/')) {
      const username = currentPath.replace('/author/', '').replace(/\/$/, '');
      return <AuthorPage username={username} />;
    }

    // Route: /bookmarks
    if (currentPath === '/bookmarks' || currentPath === '/bookmarks/') {
      return <BookmarksPage />;
    }

    // Route: /admin
    if (currentPath === '/admin' || currentPath === '/admin/') {
      return <AdminDashboardPage />;
    }

    // Default route: / (HomePage)
    return (
      <HomePage
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery('')}
      />
    );
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
          <Navbar onSearch={q => setSearchQuery(q)} searchQuery={searchQuery} />

          <main className="flex-1">
            {renderCurrentPage()}
          </main>

          <Footer />
          <AuthModal />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
