// ============================================================
// SystemStatus — /status
// Tactical Telemetry terminal (Industrial Brutalism mode 2.2)
// Substrate #0A0A0A · phosphor #EAEAEA · hazard red #E61919
// ============================================================

import { useEffect, useState } from 'react';

interface DeploymentInfo { id: string; state: string; sha: string | null; date: string | null }
interface RemoteHead { name: string; url: string; sha: string; date: string | null; state: 'OK' | 'FAIL' }
interface StatusPayload {
  generatedAt: string;
  deployments: DeploymentInfo[] | null;
  remotes: RemoteHead[];
  database: { state: 'OK' | 'FAIL'; detail: string };
}

const MONO = 'font-mono uppercase';
const CELL = 'p-3 border border-[#262626] bg-[#0A0A0A]';

function Label({ children }: { children: React.ReactNode }) {
  return <div className={`${MONO} text-[10px] tracking-[0.2em] text-[#8a8a8a]`}>{children}</div>;
}

function Crosshair({ className = '' }: { className?: string }) {
  return <span className={`text-[#333333] select-none ${className}`}>+</span>;
}

export default function SystemStatus() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [fetchState, setFetchState] = useState<'LOADING' | 'LIVE' | 'FAIL'>('LOADING');

  useEffect(() => {
    let alive = true;
    fetch('/api/system-status')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: StatusPayload) => {
        if (!alive) return;
        setData(json);
        setFetchState('LIVE');
      })
      .catch(() => {
        if (alive) setFetchState('FAIL');
      });
    return () => {
      alive = false;
    };
  }, []);

  const allRemotesOk = data?.remotes.every((r) => r.state === 'OK') ?? false;
  const systemOk = fetchState === 'LIVE' && allRemotesOk && data?.database.state === 'OK';
  const fmtTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/[.,]/g, '/').replace(/\//g, '.').slice(0, 16) : '--/-- --:--';

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-[#EAEAEA] relative overflow-x-hidden">
      {/* CRT scanlines — fixed overlay, never scrolls with content */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-40 opacity-60"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)' }}
      />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* ── MASTHEAD ── */}
        <header className="border border-[#262626] mb-px">
          <div className={`${CELL} flex items-start justify-between gap-4 !border-0`}>
            <div>
              <Label>[ PT YOGA WIBAWA MANDIRI // INFRASTRUCTURE ]</Label>
              <h1
                className="font-black uppercase leading-[0.85] tracking-[-0.04em] mt-2"
                style={{ fontSize: 'clamp(2.6rem, 9vw, 7rem)' }}
              >
                SYSTEM<br />STATUS<span className="text-[#E61919]">.</span>
              </h1>
            </div>
            <div className={`${MONO} text-right text-[10px] leading-relaxed text-[#8a8a8a] hidden sm:block`}>
              <div>REV 8.1.0</div>
              <div>UNIT / D-01</div>
              <Crosshair className="text-lg" />
            </div>
          </div>
        </header>

        {/* ── MASTER INDICATOR ROW ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626] mb-px" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          <div className={CELL}>
            <Label>LINK STATE</Label>
            <data value={fetchState} className={`${MONO} text-lg font-bold mt-1 ${fetchState === 'FAIL' ? 'text-[#E61919]' : ''}`}>{fetchState}</data>
          </div>
          <div className={CELL}>
            <label className={`${MONO} text-[10px] tracking-[0.2em] text-[#8a8a8a]`} htmlFor="db-ind">DATABASE</label>
            <div id="db-ind" className={`${MONO} text-lg font-bold mt-1 ${data?.database.state === 'OK' ? '' : 'text-[#E61919]'}`}>
              {data?.database.detail ?? '...'}
            </div>
          </div>
          <div className={CELL}>
            <Label>SYSTEM</Label>
            <output className={`${MONO} text-lg font-bold mt-1 ${systemOk ? 'text-[#4AF626]' : fetchState === 'FAIL' ? 'text-[#E61919]' : ''}`}>
              {systemOk ? 'NOMINAL' : fetchState === 'FAIL' ? 'DEGRADED' : 'SCANNING'}
            </output>
          </div>
        </section>

        {/* ── MIRROR REMOTES MATRIX ── */}
        <section className="mb-px">
          <div className={`${CELL} border-b-0`}>
            <Label>{'>>> REPOSITORY MIRRORS'} <span className="text-[#E61919]">/</span> {'4 UNITS'}</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#262626] border border-[#262626]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            {(data?.remotes ?? Array.from({ length: 4 }, () => null)).map((r, i) => (
              <article key={i} className={CELL}>
                {r ? (
                  <>
                    <div className="flex items-center justify-between">
                      <samp className={`${MONO} text-xs font-bold tracking-wider`}>{r.name}</samp>
                      <kbd className={`${MONO} text-[10px] px-1.5 py-0.5 border ${r.state === 'OK' ? 'border-[#4AF626]/60 text-[#4AF626]' : 'border-[#E61919] text-[#E61919]'}`}>{r.state}</kbd>
                    </div>
                    <dl className="mt-2 space-y-0.5">
                      <div className="flex justify-between gap-2">
                        <dt className={`${MONO} text-[10px] text-[#8a8a8a]`}>HEAD.SHA</dt>
                        <dd className={`${MONO} text-xs`}>{r.sha}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className={`${MONO} text-[10px] text-[#8a8a8a]`}>COMMIT.TS</dt>
                        <dd className={`${MONO} text-xs`}>{fmtTime(r.date)}</dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <span className={`${MONO} text-xs text-[#555555] animate-pulse`}>SCANNING UNIT_{String(i + 1).padStart(2, '0')}...</span>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ── DEPLOYMENT LOG ── */}
        <section className="mb-px">
          <div className={`${CELL} border-b-0`}>
            <Label>{'>>> PRODUCTION DEPLOYMENTS /// VERCEL'} <span className="text-[#E61919]">/</span> {'LAST 5'}</Label>
          </div>
          <div className="border border-[#262626]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            {!data?.deployments ? (
              <div className={`${CELL} ${MONO} text-xs text-[#555555]`}>
                {fetchState === 'FAIL' ? 'TELEMETRY LINK FAIL' : 'AWAITING FEED...'}
              </div>
            ) : (
              data.deployments.map((d, i) => (
                <div key={d.id + i} className={`flex items-center justify-between px-3 py-2 border-b border-[#262626] last:border-b-0 ${i === 0 ? 'bg-[#141414]' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`${MONO} text-[10px] text-[#555555] w-6`}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={`${MONO} text-[10px] px-1.5 py-0.5 border ${d.state === 'READY' ? 'border-[#4AF626]/60 text-[#4AF626]' : d.state === 'ERROR' ? 'border-[#E61919] text-[#E61919]' : 'border-[#555555] text-[#8a8a8a]'}`}>
                      {d.state}
                    </span>
                    <samp className={`${MONO} text-xs truncate`}>{d.sha ?? '--------'}</samp>
                  </div>
                  <time className={`${MONO} text-[10px] text-[#8a8a8a] whitespace-nowrap pl-3`}>{fmtTime(d.date)}</time>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── FOOTER STRIPE ── */}
        <footer className="mt-8">
          <div className="h-2 w-full" style={{ background: 'repeating-linear-gradient(-45deg, #E61919 0 12px, transparent 12px 24px)' }} />
          <div className={`${MONO} flex flex-wrap items-center justify-between gap-2 mt-3 text-[10px] text-[#555555]`}>
            <span>&copy; DHAHER LABS &reg; TELEMETRY BUS v1</span>
            <span>GEN {fmtTime(data?.generatedAt ?? null)} WIB</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
