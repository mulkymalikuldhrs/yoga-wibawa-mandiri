import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Factory } from 'lucide-react';
import { signIn } from '@/lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 px-4">
      <div className="w-full max-w-md rounded-[2rem] p-1.5 bg-white/40 ring-1 ring-black/5 shadow-[0_8px_40px_-12px_rgba(30,58,95,0.25)]">
        <div className="rounded-[calc(2rem-0.375rem)] bg-white/70 backdrop-blur-xl px-8 py-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-[#1e3a5f] flex items-center justify-center text-[#e8c24a]">
              <Factory size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight">YWM Dashboard</h1>
              <p className="text-xs text-slate-500">PT Yoga Wibawa Mandiri</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@ywm.co.id"
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-300 focus:border-[#1e3a5f]/40 focus:ring-2 focus:ring-[#1e3a5f]/10"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-300 focus:border-[#1e3a5f]/40 focus:ring-2 focus:ring-[#1e3a5f]/10"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex items-center justify-center gap-2 rounded-full bg-[#1e3a5f] px-6 py-3 text-sm font-medium text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#16304d] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:scale-105">
                <LogIn size={14} />
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
