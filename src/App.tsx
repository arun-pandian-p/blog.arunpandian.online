import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useContent } from './context/ContentProvider';
import HomePage from './pages/HomePage';
import ProjectDetails from './pages/ProjectDetails';
import NotFound from './pages/NotFound';
import AdminRoute from './components/admin/AdminRoute';

// Admin bundle is code-split so public visitors never download it
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Projects = lazy(() => import('./pages/admin/Projects'));
const Blogs = lazy(() => import('./pages/admin/Blogs'));
const Experiences = lazy(() => import('./pages/admin/Experiences'));
const Inbox = lazy(() => import('./pages/admin/Inbox'));
const HeroSettings = lazy(() => import('./pages/admin/settings/HeroSettings'));
const AboutSettings = lazy(() => import('./pages/admin/settings/AboutSettings'));
const SkillsSettings = lazy(() => import('./pages/admin/settings/SkillsSettings'));
const CertificationsSettings = lazy(() => import('./pages/admin/settings/CertificationsSettings'));
const ContactSettings = lazy(() => import('./pages/admin/settings/ContactSettings'));
const Studio = lazy(() => import('./pages/admin/Studio'));
const Canvas = lazy(() => import('./pages/admin/Canvas'));
const SeoSettings = lazy(() => import('./pages/admin/settings/SeoSettings'));

const AdminFallback = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <Loader2 className="animate-spin text-blue-600" size={28} />
  </div>
);

function App() {
  const { settings } = useContent() as any;
  // Favicon uses the uploaded favicon, else the site logo, so the tab icon
  // always matches the brand logo shown in the navbar.
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
        <Suspense fallback={<AdminFallback />}>
        <Routes>
        {/* Public Route */}
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:id" element={<ProjectDetails />} />

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="experiences" element={<Experiences />} />
          <Route path="inbox" element={<Inbox />} />
          
          <Route path="settings" element={<Settings />} />
          <Route path="settings/hero" element={<HeroSettings />} />
          <Route path="settings/about" element={<AboutSettings />} />
          <Route path="settings/skills" element={<SkillsSettings />} />
          <Route path="settings/certifications" element={<CertificationsSettings />} />
          <Route path="settings/contact" element={<ContactSettings />} />
          <Route path="studio" element={<Studio />} />
          <Route path="canvas" element={<Canvas />} />
          <Route path="settings/seo" element={<SeoSettings />} />
        </Route>
        
        {/* Catch all redirect to 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
    </>
  );
}

export default App;
