import type { Session, User } from '@supabase/supabase-js';
import { requireSupabase } from './supabase';

export interface AuthState {
  session: Session | null;
  user: User | null;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await requireSupabase().auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (state: AuthState) => void) {
  const { data } = requireSupabase().auth.onAuthStateChange((_event, session) => {
    cb({ session, user: session?.user ?? null });
  });
  return () => data.subscription.unsubscribe();
}
