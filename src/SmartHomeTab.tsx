import { useState, useEffect, useCallback, useRef } from 'react';

const AMBER = '#E8A33D';
const AMBER_HALF = '#F0D8AE';
const MUTED = '#999999';

export const IconBulb = ({ active }: any) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? AMBER : MUTED} strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.6.7.6 1.1h5.8c0-.4.2-.8.6-1.1A6 6 0 0 0 12 3z" />
  </svg>
);

const Chevron = ({ open }: any) => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#666666"
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
       style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>
    <path d="M4 2l5 4-5 4" />
  </svg>
);

/* The switch. A group that is only partly on sits in between:
   half-tinted track, knob parked in the middle. */
const Toggle = ({ on, someOn }: any) => {
  const partial = !on && someOn;
  return (
    <div style={{
      width: 52, height: 30, borderRadius: 15, flexShrink: 0,
      background: on ? AMBER : partial ? AMBER_HALF : '#DDDDDD',
      transition: 'background 160ms', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 25 : partial ? 14 : 3,
        width: 24, height: 24, borderRadius: '50%', background: '#FFFFFF',
        transition: 'left 160ms',
        boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
      }} />
    </div>
  );
};

export default function SmartHomeTab({ sb }: any) {
  const [devices, setDevices] = useState<any[] | null>(null);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
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

  /* Move the tapped row, and anything that logically moves with it,
     before the server answers. The reload 1.2s later is the truth. */
  const applyOptimistic = (ds: any[], key: string, next: boolean): any[] => {
    const target = ds.find((d) => d.key === key);
    if (!target) return ds;

    const setRow = (d: any) => ({
      ...d, on: next, someOn: next, onCount: next ? d.total : 0,
    });

    let out = ds.map((d) => {
      if (d.key === key) return setRow(d);
      if (target.isGroup && d.parent === key) return setRow(d); // children follow the master
      return d;
    });

    /* A child moved — pull the master into line, but only when the
       listed children actually cover every gang. If you've listed 3
       children for a 4-gang strip, leave it to the reload. */
    if (target.parent) {
      const kids = out.filter((d) => d.parent === target.parent);
      const master = out.find((d) => d.key === target.parent);
      if (master && kids.length === master.total) {
        const onCount = kids.filter((k) => k.on).length;
        out = out.map((d) => d.key === target.parent
          ? { ...d, onCount, on: onCount === kids.length, someOn: onCount > 0 }
          : d);
      }
    }
    return out;
  };

  const toggle = async (d: any) => {
    if (pending[d.key]) return;
    const next = !d.on;                       // partial group → turns everything on
    setPending((p) => ({ ...p, [d.key]: true }));
    setDevices((ds: any) => applyOptimistic(ds, d.key, next));
    try {
      const r = await authFetch({ method: 'POST', body: JSON.stringify({ key: d.key, on: next }) });
      if (!r.ok) throw new Error();
      setTimeout(load, 1200); // let Tuya settle, then confirm
    } catch {
      setDevices((ds: any) => applyOptimistic(ds, d.key, !next)); // roll back
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

  const roots = devices.filter((d: any) => !d.parent);
  const childrenOf = (key: string) => devices.filter((d: any) => d.parent === key);

  const statusLine = (d: any, kids: number) => {
    if (!d.online) return 'OFFLINE';
    if (d.missing?.length) return `CHECK CODES: ${d.missing.join(', ')}`;
    if (d.isGroup || kids > 0) {
      if (d.onCount === 0) return 'ALL OFF';
      if (d.onCount === d.total) return 'ALL ON';
      return `${d.onCount} OF ${d.total} ON`;
    }
    return d.on ? 'ON' : 'OFF';
  };

  const Row = ({ d, child }: any) => {
    const kids = childrenOf(d.key);
    const expandable = kids.length > 0;
    const isOpen = !!open[d.key];
    const disabled = !d.online || pending[d.key];

    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: child ? '13px 0 13px 26px' : '18px 0',
          borderBottom: '1px solid #EEEEEE',
          borderLeft: child ? '1px solid #EEEEEE' : 'none',
          marginLeft: child ? 9 : 0,
          opacity: d.online ? 1 : 0.4,
          fontFamily: "'DM Mono',monospace",
        }}
      >
        {/* left side — expands the group, or is inert for a plain row */}
        <button
          onClick={expandable ? () => setOpen((o) => ({ ...o, [d.key]: !o[d.key] })) : undefined}
          disabled={!expandable}
          aria-expanded={expandable ? isOpen : undefined}
          style={{
            flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 9,
            background: 'none', border: 'none', padding: 0, textAlign: 'left',
            cursor: expandable ? 'pointer' : 'default',
            fontFamily: 'inherit',
          }}
        >
          {expandable && <Chevron open={isOpen} />}
          <span style={{ minWidth: 0 }}>
            <span style={{
              display: 'block', fontSize: child ? 14 : 15, color: '#111111',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{d.label}</span>
            <span style={{
              display: 'block', fontSize: 11, marginTop: 4, letterSpacing: '0.08em',
              color: d.missing?.length ? '#B00' : MUTED,
            }}>
              {statusLine(d, kids.length)}
              {expandable && !isOpen ? `  ·  ${kids.length} SOCKETS` : ''}
            </span>
          </span>
        </button>

        {/* right side — the actual switch */}
        <button
          onClick={() => toggle(d)}
          disabled={disabled}
          aria-label={`${d.on ? 'Turn off' : 'Turn on'} ${d.label}`}
          style={{
            background: 'none', border: 'none', padding: 0, flexShrink: 0,
            cursor: disabled ? 'default' : 'pointer',
          }}
        >
          <Toggle on={d.on} someOn={d.someOn} />
        </button>
      </div>
    );
  };

  return (
    <div style={{ paddingTop: 8 }}>
      {problem === 'offline' && (
        <div style={{ fontSize: 12, color: '#B00', marginBottom: 16 }}>
          connection hiccup — showing the last known state
        </div>
      )}

      {roots.map((d: any) => (
        <div key={d.key}>
          <Row d={d} />
          {open[d.key] && childrenOf(d.key).map((c: any) => (
            <Row key={c.key} d={c} child />
          ))}
        </div>
      ))}

      <div style={{ fontSize: 11, color: MUTED, marginTop: 24, lineHeight: 1.6 }}>
        these are the plugs, not the ceiling lights. wall switches still work
        normally — if a lamp won't turn on here, check its wall switch first.
        tap a multi socket to open its individual sockets.
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
