import { useState, useEffect, useCallback, useRef } from 'react';

const AMBER = '#E8A33D';
const MUTED = '#999999';

export const IconBulb = ({ active }: any) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? AMBER : MUTED} strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.6.7.6 1.1h5.8c0-.4.2-.8.6-1.1A6 6 0 0 0 12 3z" />
  </svg>
);

export default function SmartHomeTab({ sb }: any) {
  const [devices, setDevices] = useState<any[] | null>(null);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const alive = useRef(true);

  const authFetch = useCallback(async (init?: any) => {
    const { data } = await sb.auth.getSession();
    const token = data?.session?.access_token;
    return fetch('/api/lights', {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });
  }, [sb]);

  const load = useCallback(async () => {
    try {
      const r = await authFetch();
      if (r.status === 503) { setProblem('subscription'); return; }
      if (!r.ok) { setProblem('offline'); return; }
      const j = await r.json();
      if (!alive.current) return;
      setProblem(null);
      setDevices(j.devices);
    } catch { setProblem('offline'); }
  }, [authFetch]);

  /* Load on open. Poll slowly, and ONLY while the tab is actually on
     screen — every poll is a Tuya API call against a monthly quota. */
  useEffect(() => {
    alive.current = true;
    load();
    const tick = () => { if (document.visibilityState === 'visible') load(); };
    const id = setInterval(tick, 20000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      alive.current = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [load]);

  const toggle = async (d: any) => {
    if (pending[d.key]) return;
    const next = !d.on;
    setPending((p) => ({ ...p, [d.key]: true }));
    setDevices((ds: any) => ds.map((x: any) => x.key === d.key ? { ...x, on: next } : x)); // optimistic
    try {
      const r = await authFetch({ method: 'POST', body: JSON.stringify({ key: d.key, on: next }) });
      if (!r.ok) throw new Error();
      setTimeout(load, 1200); // let Tuya settle, then confirm
    } catch {
      setDevices((ds: any) => ds.map((x: any) => x.key === d.key ? { ...x, on: !next } : x)); // roll back
      setProblem('offline');
    } finally {
      setPending((p) => ({ ...p, [d.key]: false }));
    }
  };

  if (problem === 'subscription') return (
    <Notice title="smart home paused"
            body="The connection to the lights needs renewing. Message Oz or Job — the lights still work from the wall switch and the Smart Life app." />
  );

  if (!devices) return <Notice title="loading" body="fetching the lights…" />;

  return (
    <div style={{ paddingTop: 8 }}>
      {problem === 'offline' && (
        <div style={{ fontSize: 12, color: '#B00', marginBottom: 16 }}>
          connection hiccup — showing the last known state
        </div>
      )}

      {devices.map((d) => (
        <button
          key={d.key}
          onClick={() => toggle(d)}
          disabled={!d.online || pending[d.key]}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16,
            padding: '18px 0', background: 'none', border: 'none',
            borderBottom: '1px solid #EEEEEE', cursor: 'pointer',
            fontFamily: "'DM Mono',monospace", textAlign: 'left',
            opacity: d.online ? 1 : 0.4,
          }}
        >
          <div>
            <div style={{ fontSize: 15, color: '#111111' }}>{d.label}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4, letterSpacing: '0.08em' }}>
              {!d.online ? 'OFFLINE' : d.on ? 'ON' : 'OFF'}
            </div>
          </div>
          <div style={{
            width: 52, height: 30, borderRadius: 15, flexShrink: 0,
            background: d.on ? AMBER : '#DDDDDD',
            transition: 'background 160ms', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: d.on ? 25 : 3,
              width: 24, height: 24, borderRadius: '50%', background: '#FFFFFF',
              transition: 'left 160ms',
            }} />
          </div>
        </button>
      ))}

      <div style={{ fontSize: 11, color: MUTED, marginTop: 24, lineHeight: 1.6 }}>
        these are the plugs, not the ceiling lights. wall switches still work
        normally — if a lamp won't turn on here, check its wall switch first.
      </div>
    </div>
  );
}

const Notice = ({ title, body }: any) => (
  <div style={{ padding: '40px 0', fontFamily: "'DM Mono',monospace" }}>
    <div style={{ fontSize: 15, color: '#111111', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{body}</div>
  </div>
);