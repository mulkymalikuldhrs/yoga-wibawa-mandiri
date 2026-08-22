import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authed' | 'guest'>('loading');
  const location = useLocation();

  useEffect(() => {
    if (!supabase) {
      setStatus('guest');
      return;
    }
    let mounted = true;
    getSession().then((session) => {
      if (mounted) setStatus(session ? 'authed' : 'guest');
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'guest') return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}
