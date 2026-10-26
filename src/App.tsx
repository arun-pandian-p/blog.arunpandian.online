import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useContent } from './context/ContentProvider';
import { api } from './services/apiClient';
import BlogPublicationPage from './pages/BlogPublicationPage';
import BlogDetails from './pages/BlogDetails';
import AuthorProfilePage from './pages/AuthorProfilePage';
import BookmarksPage from './pages/BookmarksPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import Register from './pages/Register';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UnsubscribePage from './pages/UnsubscribePage';
import NotFound from './pages/NotFound';
import WritePage from './pages/WritePage';
import AdminRoute from './components/admin/AdminRoute';

// Code-split admin and writing studio components
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Blogs = lazy(() => import('./pages/admin/Blogs'));
const Inbox = lazy(() => import('./pages/admin/Inbox'));
const SeoSettings = lazy(() => import('./pages/admin/settings/SeoSettings'));

const PageFallback = () => (
  <div className="flex h-screen items-center justify-center bg-[#FBF9F5]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="animate-spin text-[#B83A26]" size={32} />
      <span className="font-mono text-xs text-[#7A7265] uppercase tracking-widest">Loading...</span>
    </div>
  </div>
);

function App() {
  const { settings } = (useContent() as any) || {};

  useEffect(() => {
    api.auth.restoreSession();
  }, []);

  const faviconUrl = settings?.branding?.faviconUrl || settings?.branding?.logoUrl;

  return (
    <>
      {faviconUrl && typeof faviconUrl === 'string' && faviconUrl.startsWith('http') && (
        <Helmet>
          <link rel="icon" href={faviconUrl} />
          <link rel="shortcut icon" href={faviconUrl} />
          <link rel="apple-touch-icon" href={faviconUrl} />
        </Helmet>
      )}
      <Toaster position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Primary Publication Home */}
            <Route path="/" element={<BlogPublicationPage />} />
            <Route path="/blog" element={<BlogPublicationPage />} />
            <Route path="/blogs" element={<BlogPublicationPage />} />
            <Route path="/category/:category" element={<BlogPublicationPage />} />
            <Route path="/tag/:tag" element={<BlogPublicationPage />} />

            {/* Permanent Public Article URLs (Medium/DEV.to standard) */}
            <Route path="/posts/:slug" element={<BlogDetails />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/blogs/:slug" element={<BlogDetails />} />

            {/* Public Author Profile */}
            <Route path="/author/:username" element={<AuthorProfilePage />} />
            <Route path="/@:username" element={<AuthorProfilePage />} />

            {/* Reading List & Bookmarks */}
            <Route path="/bookmarks" element={<BookmarksPage />} />

            {/* User Account Settings */}
            <Route path="/settings" element={<AccountSettingsPage />} />
            <Route path="/account" element={<AccountSettingsPage />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<Login />} />

            {/* Medium/DEV.to Writing Studio */}
            <Route path="/write" element={<WritePage />} />
            <Route path="/new-story" element={<WritePage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/seo" element={<SeoSettings />} />
            </Route>

            {/* Newsletter Unsubscribe */}
            <Route path="/unsubscribe" element={<UnsubscribePage />} />

            {/* Root-level slug fallback (e.g. blog.arunpandian.online/article-slug) */}
            <Route path="/:slug" element={<BlogDetails />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
