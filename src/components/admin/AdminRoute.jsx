import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function AdminRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-ink-soft">
          <Loader2 size={32} className="animate-spin text-accent" />
          <p className="font-mono text-sm tracking-widest uppercase">Authenticating</p>
        </div>
      </div>
    );
  }

  // If no session, redirect to login
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, render children
  return children;
}
