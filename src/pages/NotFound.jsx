import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, SearchX } from 'lucide-react';
import Navbar from '../components/Navbar';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent selection:text-white">
      <Helmet>
        <title>404 - Page Not Found | Arun Pandian</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <SearchX size={80} className="text-ink-soft mb-8 animate-pulse" />
        <h1 className="text-5xl sm:text-7xl font-display font-black mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-ink-soft">Page Not Found</h2>
        <p className="text-lg mb-10 max-w-md text-ink-soft">
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-ink text-bg px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
        >
          <Home size={20} />
          Return to Home
        </Link>
      </main>
    </div>
  );
};

export default NotFound;
