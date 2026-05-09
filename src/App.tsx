import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://vspgkbrbwzkjqsclddxs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcGdrYnJid3pranFzY2xkZHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjAyODQsImV4cCI6MjA5MzgzNjI4NH0.z5mBjpsRDBTmA2S8H5gYEPvGQqfGEnF54RSxCcwA2hY'
);

const t: any = {
  bg: '#FFFFFF',
  surfaceAlt: '#F5F5F5',
  border: '#E0E0E0',
  borderStrong: '#111111',
  textPrimary: '#111111',
  textSecondary: '#555555',
  textMuted: '#AAAAAA',
  amber: '#D4890A',
  amberBg: '#FFF4E0',
  amberText: '#8A5500',
  amberVivid: '#F5A623',
  success: '#1A8A4A',
  successVivid: '#22C55E',
  blue: '#1D4ED8',
  blueVivid: '#3B82F6',
  urgent: '#DC2626',
  urgentBg: '#FEF2F2',
};

const URGENCY: any = {
  low: { label: 'LOW', color: t.textMuted, bg: t.surfaceAlt },
  medium: { label: 'MEDIUM', color: t.amber, bg: '#FFF4E0' },
  high: { label: 'HIGH', color: t.urgent, bg: '#FEF2F2' },
};

const daysSince = (d: any) =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 999;

const IconCart = ({ active }: any) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    strokeWidth="1.5"
    stroke={active ? t.amber : t.textMuted}
    strokeLinecap="square"
    strokeLinejoin="miter"
  >
    <path d="M2 2h2.5l2 10h9l2-7H6.5" />
    <rect
      x="8"
      y="16"
      width="1.5"
      height="1.5"
      fill={active ? t.amber : t.textMuted}
    />
    <rect
      x="13"
      y="16"
      width="1.5"
      height="1.5"
      fill={active ? t.amber : t.textMuted}
    />
  </svg>
);

const IconClipboard = ({ active }: any) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    strokeWidth="1.5"
    stroke={active ? t.amber : t.textMuted}
    strokeLinecap="square"
    strokeLinejoin="miter"
  >
    <rect x="4" y="5" width="14" height="15" />
    <path d="M8 5V4h6v1M7 10h8M7 13h6M7 16h4" />
  </svg>
);

function HausLogo({ profiles = [], size = 44 }: any) {
  const s = size,
    cx = s / 2,
    stroke = s * 0.055;
  const rp = s * 0.08,
    rl = s * 0.04,
    rr = s * 0.96,
    rb = s * 0.46,
    wl = s * 0.12,
    wr = s * 0.88,
    wb = s * 0.92;
  const hp = [
    `M ${cx} ${rp}`,
    `L ${rr} ${rb}`,
    `L ${wr} ${rb}`,
    `L ${wr} ${wb}`,
    `L ${wl} ${wb}`,
    `L ${wl} ${rb}`,
    `L ${rl} ${rb}`,
    `Z`,
  ].join(' ');
  const users =
    profiles.length > 0
      ? profiles
      : [
          { id: 'a', color: '#F5A623' },
          { id: 'b', color: '#3B82F6' },
        ];
  const dr = s * 0.155,
    ov = dr * 0.38,
    st = dr * 2 - ov,
    tw = users.length * dr * 2 - (users.length - 1) * ov;
  const sx = cx - tw / 2 + dr,
    dy = wb - (wb - rb) * 0.42;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <path
        d={hp}
        stroke={t.borderStrong}
        strokeWidth={stroke}
        strokeLinejoin="miter"
        strokeLinecap="square"
        fill="none"
      />
      <clipPath id="hc">
        <path d={hp} />
      </clipPath>
      <g clipPath="url(#hc)">
        {users.map((u: any, i: number) => (
          <circle
            key={u.id}
            cx={sx + i * st}
            cy={dy}
            r={dr}
            fill={u.color}
            opacity={0.9}
          />
        ))}
      </g>
    </svg>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.sans{font-family:'DM Sans',sans-serif}.mono{font-family:'DM Mono',monospace}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#E0E0E0}
.label{font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#AAAAAA}
.row-btn{width:72px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;border-radius:0;cursor:pointer;transition:background .15s,border-color .15s,color .15s,transform .1s;white-space:nowrap;background:none}
.row-btn:active{transform:scale(.97)}
.row-btn--bought{border:1.5px solid #1A8A4A;color:#1A8A4A}.row-btn--bought:hover{background:#22C55E;border-color:#22C55E;color:#fff}
.row-btn--undo{border:1.5px solid #E0E0E0;color:#AAAAAA}.row-btn--undo:hover{border-color:#555555;color:#555555}
.row-btn--add{border:1.5px solid #1D4ED8;color:#1D4ED8}.row-btn--add:hover{background:#1D4ED8;color:#fff}
.row-btn--grab{border:1.5px solid #D4890A;color:#D4890A}.row-btn--grab:hover{background:#D4890A;color:#fff}
.row-btn--done{border:1.5px solid #1A8A4A;color:#1A8A4A}.row-btn--done:hover{background:#22C55E;border-color:#22C55E;color:#fff}
.haus-input{width:100%;height:48px;padding:0 14px;background:#fff;border:1.5px solid #111111;color:#111111;font-family:'DM Sans',sans-serif;font-size:15px;outline:none;border-radius:0;transition:border-color .15s,box-shadow .15s;letter-spacing:-.01em}
.haus-input:focus{border-color:#D4890A;box-shadow:0 0 0 3px #FFF4E0}.haus-input::placeholder{color:#AAAAAA;font-weight:300}
.qty-btn{width:36px;height:36px;background:none;border:1.5px solid #E0E0E0;color:#111111;font-size:18px;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;border-radius:0;transition:border-color .12s,background .12s}
.qty-btn:hover{border-color:#D4890A;background:#FFF4E0}
.add-btn{height:36px;padding:0 32px;background:#D4890A;color:#FFF;border:1.5px solid #D4890A;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;border-radius:0;transition:background .15s,border-color .15s,transform .1s;white-space:nowrap}
.add-btn:hover{background:#8A5500;border-color:#8A5500}.add-btn:active{transform:scale(.98)}.add-btn:disabled{opacity:.25;cursor:not-allowed;transform:none}
.pill{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border:1.5px solid #E0E0E0;background:#fff;color:#555555;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;border-radius:0;transition:all .12s;white-space:nowrap}
.pill:hover{border-color:#D4890A;color:#8A5500;background:#FFF4E0}
.pill-tag{font-family:'DM Mono',monospace;font-size:9px;font-weight:500;letter-spacing:.1em;color:#FFF;background:#D4890A;padding:2px 5px}
.clear-btn{height:28px;padding:0 14px;background:none;border:1.5px solid #E0E0E0;color:#AAAAAA;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;border-radius:0;transition:all .12s;white-space:nowrap}
.clear-btn:hover{border-color:#DC2626;color:#DC2626}
.list-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #E0E0E0}
.list-row:first-child{border-top:1px solid #E0E0E0}.list-row.flash{animation:rF .45s ease}
@keyframes rF{0%{background:#FFF4E0}100%{background:transparent}}
.bought-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #E0E0E0;opacity:.45}
.bought-row:first-child{border-top:1px solid #E0E0E0}
.overdue-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #E0E0E0}
.overdue-row:first-child{border-top:1px solid #E0E0E0}
.task-row{display:flex;align-items:flex-start;gap:0;padding:14px 0;border-bottom:1px solid #E0E0E0}
.task-row:first-child{border-top:1px solid #E0E0E0}.task-row.flash{animation:rF .45s ease}
.arch-row{display:flex;align-items:flex-start;gap:0;padding:11px 0;border-bottom:1px solid #E0E0E0;opacity:.4}
.arch-row:first-child{border-top:1px solid #E0E0E0}
.icon-box{width:36px;height:36px;border:1.5px solid #E0E0E0;background:#F5F5F5;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.live-dot{width:7px;height:7px;border-radius:50%;background:#22C55E;animation:lp 2.5s infinite}
@keyframes lp{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.5)}50%{opacity:.8;box-shadow:0 0 0 4px rgba(34,197,94,0)}}
.u-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.days-badge{font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.06em;color:#FFF;background:#D4890A;padding:2px 7px}
.urgency-badge{font-family:'DM Mono',monospace;font-size:9px;font-weight:500;letter-spacing:.1em;padding:2px 6px;white-space:nowrap;flex-shrink:0}
.status-bar{width:3px;align-self:stretch;flex-shrink:0;min-height:44px;margin-right:12px}
.urgency-opt{display:inline-flex;align-items:center;padding:5px 12px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:1.5px solid #E0E0E0;background:none;color:#AAAAAA;border-radius:0;transition:all .12s;white-space:nowrap}
.urgency-opt.sl{border-color:#AAAAAA;color:#555555;background:#F5F5F5}
.urgency-opt.sm{border-color:#D4890A;color:#8A5500;background:#FFF4E0}
.urgency-opt.sh{border-color:#DC2626;color:#DC2626;background:#FEF2F2}
.bottom-nav{position:fixed;bottom:0;left:0;right:0;height:72px;border-top:1.5px solid #111111;display:flex;align-items:stretch;z-index:100;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.nav-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:0;position:relative;transition:background .12s}
.nav-tab:hover{background:#FFF4E0}.nav-tab.active::before{content:'';position:absolute;top:-1.5px;left:0;right:0;height:2px;background:#D4890A}
.nav-tab+.nav-tab{border-left:1px solid #E0E0E0}
.nav-label{font-family:'DM Mono',monospace;font-size:9px;font-weight:500;letter-spacing:.12em;text-transform:uppercase}
.signout-btn{background:none;border:1px solid #E0E0E0;color:#AAAAAA;font-family:'DM Mono',monospace;font-size:9px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;cursor:pointer;border-radius:0;transition:all .12s}
.signout-btn:hover{border-color:#DC2626;color:#DC2626}
.login-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;background:#fff}
.login-card{width:100%;max-width:360px}
.login-field{width:100%;height:52px;padding:0 16px;background:#fff;border:1.5px solid #111111;color:#111111;font-family:'DM Sans',sans-serif;font-size:15px;outline:none;border-radius:0;letter-spacing:-.01em;transition:border-color .15s,box-shadow .15s}
.login-field:focus{border-color:#D4890A;box-shadow:0 0 0 3px #FFF4E0}.login-field::placeholder{color:#AAAAAA;font-weight:300}
.login-btn{width:100%;height:52px;background:#111111;color:#FFF;border:1.5px solid #111111;font-family:'DM Mono',monospace;font-size:12px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;border-radius:0;transition:background .15s,border-color .15s,transform .1s}
.login-btn:hover{background:#D4890A;border-color:#D4890A}.login-btn:active{transform:scale(.99)}.login-btn:disabled{opacity:.3;cursor:not-allowed;transform:none}
.login-error{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.06em;color:#DC2626;padding:10px 14px;border:1.5px solid #DC2626;background:#FEF2F2;animation:fe .2s ease}
@keyframes fe{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.loading-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.1em;color:#AAAAAA}
`;

function LoginPage({ onLogin }: any) {
  const [email, setEmail] = useState(''),
    [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!email.trim() || !pw.trim()) return;
    setLoading(true);
    setError('');
    const { data, error: err } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password: pw,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else onLogin(data.user);
  };
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 60,
          }}
        >
          <HausLogo size={72} />
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 40,
              fontWeight: 300,
              letterSpacing: '-0.05em',
              color: '#111111',
              marginTop: 18,
              lineHeight: 1,
            }}
          >
            haus
          </div>
          <div
            className="label"
            style={{ marginTop: 12, letterSpacing: '0.2em' }}
          >
            ein zwei, ein zwei
          </div>
        </div>
        <input
          className="login-field"
          type="email"
          placeholder="email"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          onKeyDown={(e: any) => e.key === 'Enter' && submit()}
          style={{ borderBottom: 'none' }}
        />
        <div style={{ position: 'relative' }}>
          <input
            className="login-field"
            type={showPw ? 'text' : 'password'}
            placeholder="password"
            value={pw}
            autoComplete="current-password"
            onChange={(e) => {
              setPw(e.target.value);
              setError('');
            }}
            onKeyDown={(e: any) => e.key === 'Enter' && submit()}
            style={{ paddingRight: 56 }}
          />
          <button
            onClick={() => setShowPw((p: boolean) => !p)}
            tabIndex={-1}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Mono',monospace",
              fontSize: 9,
              color: '#AAAAAA',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {showPw ? 'hide' : 'show'}
          </button>
        </div>
        {error && (
          <div className="login-error" style={{ marginTop: 6 }}>
            {error}
          </div>
        )}
        <button
          className="login-btn"
          style={{ marginTop: 6 }}
          onClick={submit}
          disabled={!email.trim() || !pw.trim() || loading}
        >
          {loading ? 'signing in...' : 'sign in'}
        </button>
        <div
          style={{
            marginTop: 44,
            textAlign: 'center',
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            color: '#AAAAAA',
            letterSpacing: '0.06em',
            lineHeight: 2,
          }}
        >
          private household app
          <br />
          access by invitation only
        </div>
      </div>
    </div>
  );
}

function ShoppingTab({ user, profiles }: any) {
  const [items, setItems] = useState<any[]>([]),
    [entries, setEntries] = useState<any[]>([]);
  const [input, setInput] = useState(''),
    [qty, setQty] = useState(1);
  const [sugs, setSugs] = useState<any[]>([]),
    [flashId, setFlashId] = useState<any>(null);
  const [busy, setBusy] = useState(true);
  const ref = useRef<any>(null);

  useEffect(() => {
    Promise.all([
      sb.from('shopping_items').select('*').order('name'),
      sb
        .from('shopping_list_entries')
        .select('*')
        .order('created_at', { ascending: false }),
    ]).then(([{ data: it }, { data: en }]) => {
      setItems(it || []);
      setEntries(en || []);
      setBusy(false);
    });
  }, []);

  useEffect(() => {
    const ch = sb
      .channel('sle_rt')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'shopping_list_entries' },
        (p: any) => {
          if (p.eventType === 'INSERT')
            setEntries((prev: any[]) =>
              prev.some((e: any) => e.id === p.new.id) ? prev : [p.new, ...prev]
            );
          if (p.eventType === 'UPDATE')
            setEntries((prev: any[]) =>
              prev.map((e: any) => (e.id === p.new.id ? p.new : e))
            );
          if (p.eventType === 'DELETE')
            setEntries((prev: any[]) =>
              prev.filter((e: any) => e.id !== p.old.id)
            );
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  useEffect(() => {
    if (!input) {
      setSugs([]);
      return;
    }
    const lq = input.toLowerCase();
    setSugs(
      items
        .filter((i: any) => i.name.toLowerCase().includes(lq))
        .sort(
          (a: any, b: any) =>
            daysSince(a.last_bought_at) - daysSince(b.last_bought_at)
        )
        .slice(0, 5)
    );
  }, [input, items]);

  const overdue = items
    .filter((i: any) => {
      if (!i.last_bought_at) return false;
      return !entries
        .filter((e: any) => !e.is_checked)
        .some((e: any) => e.shopping_item_id === i.id);
    })
    .sort(
      (a: any, b: any) =>
        daysSince(a.last_bought_at) - daysSince(b.last_bought_at)
    )
    .slice(0, 3);

  const addItem = async (src: any) => {
    let itemId: any, name: string, icon: string;
    if (typeof src === 'object' && src.id) {
      itemId = src.id;
      name = src.name;
      icon = src.icon;
      sb.from('shopping_items')
        .update({ times_added: src.times_added + 1 })
        .eq('id', src.id);
      setItems((p: any[]) =>
        p.map((i: any) =>
          i.id === src.id ? { ...i, times_added: i.times_added + 1 } : i
        )
      );
    } else {
      name = typeof src === 'string' ? src : src.name;
      icon = '🛒';
      const { data: ex } = await sb
        .from('shopping_items')
        .select('*')
        .eq('name', name)
        .maybeSingle();
      if (ex) {
        itemId = ex.id;
        icon = ex.icon;
        sb.from('shopping_items')
          .update({ times_added: ex.times_added + 1 })
          .eq('id', ex.id);
        setItems((p: any[]) =>
          p.map((i: any) =>
            i.id === ex.id ? { ...i, times_added: i.times_added + 1 } : i
          )
        );
      } else {
        const { data: ni } = await sb
          .from('shopping_items')
          .insert({ name, icon })
          .select()
          .single();
        itemId = ni.id;
        setItems((p: any[]) => [...p, ni]);
      }
    }
    const { data: entry } = await sb
      .from('shopping_list_entries')
      .insert({
        shopping_item_id: itemId,
        name,
        icon,
        quantity: qty,
        added_by: user.id,
      })
      .select()
      .single();
    sb.from('item_history').insert({
      shopping_item_id: itemId,
      action: 'added',
      quantity_at_event: qty,
      performed_by: user.id,
    });
    if (entry) {
      setFlashId(entry.id);
      setTimeout(() => setFlashId(null), 500);
    }
    setInput('');
    setQty(1);
    setSugs([]);
    ref.current?.focus();
  };

  const markBought = async (e: any) => {
    await sb
      .from('shopping_list_entries')
      .update({
        is_checked: true,
        checked_by: user.id,
        checked_at: new Date().toISOString(),
      })
      .eq('id', e.id);
    sb.from('shopping_items')
      .update({ last_bought_at: new Date().toISOString() })
      .eq('id', e.shopping_item_id);
    sb.from('item_history').insert({
      shopping_item_id: e.shopping_item_id,
      action: 'bought',
      quantity_at_event: e.quantity,
      performed_by: user.id,
    });
    setItems((p: any[]) =>
      p.map((i: any) =>
        i.id === e.shopping_item_id
          ? { ...i, last_bought_at: new Date().toISOString() }
          : i
      )
    );
  };
  const unmark = async (id: any) =>
    sb
      .from('shopping_list_entries')
      .update({ is_checked: false, checked_by: null, checked_at: null })
      .eq('id', id);
  const clearBought = async () => {
    const ids = entries.filter((e: any) => e.is_checked).map((e: any) => e.id);
    if (ids.length)
      await sb.from('shopping_list_entries').delete().in('id', ids);
  };
  const prof = (uid: any) => profiles.find((p: any) => p.id === uid);
  const active = entries.filter((e: any) => !e.is_checked),
    bought = entries.filter((e: any) => e.is_checked);

  if (busy)
    return (
      <div
        style={{
          padding: '60px 0',
          textAlign: 'center',
          fontFamily: "'DM Mono',monospace",
          fontSize: 11,
          color: '#AAAAAA',
          letterSpacing: '0.08em',
        }}
      >
        loading list...
      </div>
    );

  return (
    <div>
      <div style={{ marginBottom: 48 }}>
        <input
          ref={ref}
          className="haus-input"
          placeholder="add an item..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e: any) =>
            e.key === 'Enter' && input.trim() && addItem(input.trim())
          }
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              className="qty-btn"
              onClick={() => setQty((q: number) => Math.max(1, q - 1))}
            >
              −
            </button>
            <div
              style={{
                width: 44,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #E0E0E0',
                borderLeft: 'none',
                borderRight: 'none',
                fontFamily: "'DM Mono',monospace",
                fontSize: 14,
                color: '#111111',
              }}
            >
              {qty}
            </div>
            <button
              className="qty-btn"
              onClick={() => setQty((q: number) => q + 1)}
            >
              +
            </button>
          </div>
          <button
            className="add-btn"
            disabled={!input.trim()}
            onClick={() => addItem(input.trim())}
          >
            add to list
          </button>
        </div>
        {sugs.length > 0 && (
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}
          >
            {sugs.map((s: any) => (
              <button key={s.id} className="pill" onClick={() => addItem(s)}>
                <span>{s.icon}</span>
                <span>{s.name}</span>
                {daysSince(s.last_bought_at) > 7 && (
                  <span className="pill-tag">overdue</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginBottom: 52 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <span className="label">to get</span>
          <span className="label" style={{ color: '#111111', fontWeight: 500 }}>
            {active.length}
          </span>
        </div>
        {active.length === 0 ? (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              border: '1.5px dashed #E0E0E0',
              fontFamily: "'DM Mono',monospace",
              fontSize: 11,
              color: '#AAAAAA',
              letterSpacing: '0.06em',
            }}
          >
            list is empty
          </div>
        ) : (
          <div>
            {active.map((e: any) => {
              const p = prof(e.added_by);
              return (
                <div
                  key={e.id}
                  className={`list-row${flashId === e.id ? ' flash' : ''}`}
                >
                  <div className="icon-box">{e.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="sans"
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {e.name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        marginTop: 4,
                      }}
                    >
                      <div
                        className="u-dot"
                        style={{ background: p?.color || '#AAAAAA' }}
                      />
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          color: '#555555',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {p?.label || '—'}
                        {e.quantity > 1 ? ` · ×${e.quantity}` : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    className="row-btn row-btn--bought"
                    onClick={() => markBought(e)}
                  >
                    bought
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {bought.length > 0 && (
        <div style={{ marginBottom: 52 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <span className="label" style={{ color: '#1A8A4A' }}>
              in basket · {bought.length}
            </span>
            <button className="clear-btn" onClick={clearBought}>
              clear all
            </button>
          </div>
          <div>
            {bought.map((e: any) => {
              const p = prof(e.checked_by);
              return (
                <div key={e.id} className="bought-row">
                  <div className="icon-box" style={{ opacity: 0.45 }}>
                    {e.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="sans"
                      style={{
                        fontSize: 15,
                        fontWeight: 400,
                        textDecoration: 'line-through',
                        color: '#AAAAAA',
                      }}
                    >
                      {e.name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        marginTop: 4,
                      }}
                    >
                      <div
                        className="u-dot"
                        style={{ background: p?.color || '#AAAAAA' }}
                      />
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          color: '#AAAAAA',
                          letterSpacing: '0.06em',
                        }}
                      >
                        BOUGHT · {p?.label || '—'}
                      </span>
                    </div>
                  </div>
                  <button
                    className="row-btn row-btn--undo"
                    onClick={() => unmark(e.id)}
                  >
                    undo
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {overdue.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <span className="label">might need soon</span>
            <span
              className="label"
              style={{ color: '#D4890A', fontWeight: 500 }}
            >
              overdue
            </span>
          </div>
          <div>
            {overdue.map((item: any) => (
              <div key={item.id} className="overdue-row">
                <div className="icon-box" style={{ opacity: 0.75 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    className="sans"
                    style={{ fontSize: 14, fontWeight: 500, color: '#555555' }}
                  >
                    {item.name}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span className="days-badge">
                      {daysSince(item.last_bought_at)}d ago
                    </span>
                  </div>
                </div>
                <button
                  className="row-btn row-btn--add"
                  onClick={() => addItem(item)}
                >
                  + add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VerwaltungTab({ user, profiles }: any) {
  const [tasks, setTasks] = useState<any[]>([]),
    [input, setInput] = useState('');
  const [urgency, setUrgency] = useState('medium'),
    [flashId, setFlashId] = useState<any>(null);
  const [showArchive, setShowArchive] = useState(true),
    [busy, setBusy] = useState(true);
  const ref = useRef<any>(null);

  useEffect(() => {
    sb.from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }: any) => {
        setTasks(data || []);
        setBusy(false);
      });
  }, []);

  useEffect(() => {
    const ch = sb
      .channel('tasks_rt')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'tasks' },
        (p: any) => {
          if (p.eventType === 'INSERT')
            setTasks((prev: any[]) =>
              prev.some((t: any) => t.id === p.new.id) ? prev : [p.new, ...prev]
            );
          if (p.eventType === 'UPDATE')
            setTasks((prev: any[]) =>
              prev.map((t: any) => (t.id === p.new.id ? p.new : t))
            );
          if (p.eventType === 'DELETE')
            setTasks((prev: any[]) =>
              prev.filter((t: any) => t.id !== p.old.id)
            );
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  const addTask = async () => {
    if (!input.trim()) return;
    const { data } = await sb
      .from('tasks')
      .insert({ title: input.trim(), urgency, created_by: user.id })
      .select()
      .single();
    if (data) {
      setFlashId(data.id);
      setTimeout(() => setFlashId(null), 500);
    }
    setInput('');
    ref.current?.focus();
  };

  const grab = (id: any) =>
    sb
      .from('tasks')
      .update({
        status: 'grabbed',
        grabbed_by: user.id,
        grabbed_at: new Date().toISOString(),
      })
      .eq('id', id);
  const drop = (id: any) =>
    sb
      .from('tasks')
      .update({ status: 'open', grabbed_by: null, grabbed_at: null })
      .eq('id', id);
  const done = (id: any) =>
    sb
      .from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', id);
  const reopen = (id: any) =>
    sb
      .from('tasks')
      .update({
        status: 'open',
        grabbed_by: null,
        grabbed_at: null,
        completed_at: null,
      })
      .eq('id', id);
  const clearDone = () => {
    const ids = tasks
      .filter((t: any) => t.status === 'done')
      .map((t: any) => t.id);
    if (ids.length) sb.from('tasks').delete().in('id', ids);
  };
  const sbc = (task: any) => {
    if (task.status === 'done') return '#22C55E';
    if (task.status === 'grabbed')
      return task.urgency === 'high' ? '#DC2626' : '#D4890A';
    if (task.urgency === 'high') return '#DC2626';
    if (task.urgency === 'medium') return '#D4890A';
    return '#E0E0E0';
  };
  const prof = (uid: any) => profiles.find((p: any) => p.id === uid);
  const UB = ({ u }: any) => (
    <span
      className="urgency-badge"
      style={{
        color: URGENCY[u].color,
        background: URGENCY[u].bg,
        border: `1px solid ${u === 'low' ? '#E0E0E0' : URGENCY[u].color}33`,
      }}
    >
      {URGENCY[u].label}
    </span>
  );

  const TR = ({ task, v }: any) => {
    const isDone = v === 'done',
      isOpen = v === 'open',
      isGrabbed = v === 'grabbed',
      isMe = task.grabbed_by === user.id;
    const gp = prof(task.grabbed_by);
    return (
      <div
        className={`${isDone ? 'arch-row' : 'task-row'}${
          flashId === task.id ? ' flash' : ''
        }`}
      >
        <div className="status-bar" style={{ background: sbc(task) }} />
        <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <div
            className="sans"
            style={{
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              lineHeight: 1.45,
              color: isDone ? '#AAAAAA' : '#111111',
              textDecoration: isDone ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 7,
              flexWrap: 'wrap',
            }}
          >
            <UB u={task.urgency} />
            {(isGrabbed || isDone) && gp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div className="u-dot" style={{ background: gp.color }} />
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    color: isDone ? '#AAAAAA' : '#555555',
                  }}
                >
                  {isDone ? 'DONE · ' : ''}
                  {gp.label}
                </span>
              </div>
            )}
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: '#AAAAAA',
                letterSpacing: '0.04em',
              }}
            >
              {daysSince(task.created_at)}d ago
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            flexShrink: 0,
          }}
        >
          {isOpen && (
            <button
              className="row-btn row-btn--grab"
              onClick={() => grab(task.id)}
            >
              grab
            </button>
          )}
          {isGrabbed && isMe && (
            <>
              <button
                className="row-btn row-btn--done"
                onClick={() => done(task.id)}
              >
                done
              </button>
              <button
                className="row-btn row-btn--undo"
                onClick={() => drop(task.id)}
              >
                drop
              </button>
            </>
          )}
          {isGrabbed && !isMe && (
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: '#AAAAAA',
                letterSpacing: '0.06em',
                paddingTop: 6,
                textAlign: 'right',
              }}
            >
              grabbed
            </span>
          )}
          {isDone && (
            <button
              className="row-btn row-btn--undo"
              onClick={() => reopen(task.id)}
            >
              reopen
            </button>
          )}
        </div>
      </div>
    );
  };

  const open = tasks.filter((t: any) => t.status === 'open');
  const grabbed = tasks.filter((t: any) => t.status === 'grabbed');
  const doneT = tasks.filter((t: any) => t.status === 'done');

  if (busy)
    return (
      <div
        style={{
          padding: '60px 0',
          textAlign: 'center',
          fontFamily: "'DM Mono',monospace",
          fontSize: 11,
          color: '#AAAAAA',
          letterSpacing: '0.08em',
        }}
      >
        loading tasks...
      </div>
    );

  return (
    <div>
      <div style={{ marginBottom: 48 }}>
        <input
          ref={ref}
          className="haus-input"
          placeholder="describe a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e: any) => e.key === 'Enter' && addTask()}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              ['low', 'sl'],
              ['medium', 'sm'],
              ['high', 'sh'],
            ].map(([u, cls]) => (
              <button
                key={u}
                className={`urgency-opt${urgency === u ? ' ' + cls : ''}`}
                onClick={() => setUrgency(u)}
              >
                {URGENCY[u].label}
              </button>
            ))}
          </div>
          <button
            className="add-btn"
            disabled={!input.trim()}
            onClick={addTask}
          >
            add task
          </button>
        </div>
      </div>
      {open.length > 0 && (
        <div style={{ marginBottom: 44 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <span className="label">open</span>
            <span
              className="label"
              style={{ color: '#111111', fontWeight: 500 }}
            >
              {open.length}
            </span>
          </div>
          <div>
            {open.map((task: any) => (
              <TR key={task.id} task={task} v="open" />
            ))}
          </div>
        </div>
      )}
      {grabbed.length > 0 && (
        <div style={{ marginBottom: 44 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <span className="label" style={{ color: '#D4890A' }}>
              in progress · {grabbed.length}
            </span>
          </div>
          <div>
            {grabbed.map((task: any) => (
              <TR key={task.id} task={task} v="grabbed" />
            ))}
          </div>
        </div>
      )}
      {open.length === 0 && grabbed.length === 0 && (
        <div
          style={{
            padding: '40px 0',
            textAlign: 'center',
            border: '1.5px dashed #E0E0E0',
            fontFamily: "'DM Mono',monospace",
            fontSize: 11,
            color: '#AAAAAA',
            letterSpacing: '0.06em',
            marginBottom: 44,
          }}
        >
          no open tasks
        </div>
      )}
      {doneT.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="label" style={{ color: '#1A8A4A' }}>
                done · {doneT.length}
              </span>
              <button
                onClick={() => setShowArchive((p: boolean) => !p)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  color: '#AAAAAA',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: 0,
                }}
              >
                {showArchive ? 'hide' : 'show'}
              </button>
            </div>
            <button className="clear-btn" onClick={clearDone}>
              clear all
            </button>
          </div>
          {showArchive && (
            <div>
              {doneT.map((task: any) => (
                <TR key={task.id} task={task} v="done" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AppShell({ user, profiles, onSignOut }: any) {
  const [tab, setTab] = useState('shopping');
  const me = profiles.find((p: any) => p.id === user.id) || {
    id: user.id,
    label: 'ME',
    color: '#F5A623',
  };
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        fontFamily: "'DM Mono',monospace",
        color: '#111111',
      }}
    >
      <div
        style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px 120px' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HausLogo profiles={profiles} size={44} />
            <div>
              <div
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 28,
                  fontWeight: 300,
                  letterSpacing: '-0.04em',
                  color: '#111111',
                  lineHeight: 1,
                }}
              >
                haus
              </div>
              <div className="label" style={{ marginTop: 7 }}>
                {tab === 'shopping' ? 'einkaufsliste' : 'verwaltung'}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', paddingTop: 4 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                justifyContent: 'flex-end',
                marginBottom: 7,
              }}
            >
              <div className="live-dot" />
              <span className="label">live sync</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: me.color,
                  }}
                />
                <span className="label" style={{ color: '#555555' }}>
                  {me.label}
                </span>
              </div>
              <button className="signout-btn" onClick={onSignOut}>
                out
              </button>
            </div>
          </div>
        </div>
        {tab === 'shopping' && <ShoppingTab user={user} profiles={profiles} />}
        {tab === 'verwaltung' && (
          <VerwaltungTab user={user} profiles={profiles} />
        )}
      </div>
      <nav className="bottom-nav">
        <button
          className={`nav-tab${tab === 'shopping' ? ' active' : ''}`}
          onClick={() => setTab('shopping')}
        >
          <IconCart active={tab === 'shopping'} />
          <span
            className="nav-label"
            style={{ color: tab === 'shopping' ? '#D4890A' : '#AAAAAA' }}
          >
            einkauf
          </span>
        </button>
        <button
          className={`nav-tab${tab === 'verwaltung' ? ' active' : ''}`}
          onClick={() => setTab('verwaltung')}
        >
          <IconClipboard active={tab === 'verwaltung'} />
          <span
            className="nav-label"
            style={{ color: tab === 'verwaltung' ? '#D4890A' : '#AAAAAA' }}
          >
            verwaltung
          </span>
        </button>
      </nav>
    </div>
  );
}

function SetPasswordPage({ onDone }: any) {
    const [pw, setPw] = useState("");
      const [pw2, setPw2] = useState("");
        const [error, setError] = useState("");
          const [loading, setLoading] = useState(false);
            const [done, setDone] = useState(false);

              const submit = async () => {
                  if (pw.length < 6) { setError("password must be at least 6 characters"); return; }
                      if (pw !== pw2) { setError("passwords do not match"); return; }
                          setLoading(true); setError("");
                              const { error: err } = await sb.auth.updateUser({ password: pw });
                                  if (err) { setError(err.message); setLoading(false); }
                                      else { setDone(true); setTimeout(() => onDone(), 1500); }
                                        };

                                          return (
                                              <div className="login-wrap">
                                                    <div className="login-card">
                                                            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:52}}>
                                                                      <HausLogo size={64}/>
                                                                                <div style={{fontFamily:"'DM Mono',monospace",fontSize:36,fontWeight:300,letterSpacing:"-0.05em",color:"#111111",marginTop:16,lineHeight:1}}>haus</div>
                                                                                          <div className="label" style={{marginTop:10,letterSpacing:"0.2em"}}>set your password</div>
                                                                                                  </div>

                                                                                                          {done ? (
                                                                                                                    <div style={{textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:"#1A8A4A",letterSpacing:"0.08em",padding:"20px 0"}}>
                                                                                                                                password set — signing you in...
                                                                                                                                          </div>
                                                                                                                                                  ) : (
                                                                                                                                                            <>
                                                                                                                                                                        <input className="login-field" type="password" placeholder="choose a password"
                                                                                                                                                                                      value={pw} onChange={e=>{setPw(e.target.value);setError("");}}
                                                                                                                                                                                                    onKeyDown={(e:any)=>e.key==="Enter"&&submit()}
                                                                                                                                                                                                                  style={{borderBottom:"none"}}/>
                                                                                                                                                                                                                              <input className="login-field" type="password" placeholder="confirm password"
                                                                                                                                                                                                                                            value={pw2} onChange={e=>{setPw2(e.target.value);setError("");}}
                                                                                                                                                                                                                                                          onKeyDown={(e:any)=>e.key==="Enter"&&submit()}/>
                                                                                                                                                                                                                                                                      {error&&<div className="login-error" style={{marginTop:6}}>{error}</div>}
                                                                                                                                                                                                                                                                                  <button className="login-btn" style={{marginTop:6}}
                                                                                                                                                                                                                                                                                                onClick={submit} disabled={!pw.trim()||!pw2.trim()||loading}>
                                                                                                                                                                                                                                                                                                              {loading?"setting password...":"set password"}
                                                                                                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                                                                                                                    </>
                                                                                                                                                                                                                                                                                                                                            )}
                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                                        export default function HausApp() {
                                                                                                                                                                                                                                                                                                                                                          const [user,setUser]=useState<any>(null);
                                                                                                                                                                                                                                                                                                                                                            const [profiles,setProfiles]=useState<any[]>([]);
                                                                                                                                                                                                                                                                                                                                                              const [booting,setBooting]=useState(true);
                                                                                                                                                                                                                                                                                                                                                                const [needsPassword,setNeedsPassword]=useState(false);

                                                                                                                                                                                                                                                                                                                                                                  const loadProfiles=useCallback(async()=>{
                                                                                                                                                                                                                                                                                                                                                                      const {data}=await sb.from("profiles").select("*");
                                                                                                                                                                                                                                                                                                                                                                          if(data?.length) setProfiles(data);
                                                                                                                                                                                                                                                                                                                                                                            },[]);

                                                                                                                                                                                                                                                                                                                                                                              useEffect(()=>{
                                                                                                                                                                                                                                                                                                                                                                                  // Detect invite/recovery token in URL hash
                                                                                                                                                                                                                                                                                                                                                                                      const hash = window.location.hash;
                                                                                                                                                                                                                                                                                                                                                                                          if (hash && hash.includes("type=invite")) {
                                                                                                                                                                                                                                                                                                                                                                                                // Exchange the token for a session
                                                                                                                                                                                                                                                                                                                                                                                                      sb.auth.getSession().then(({ data: { session } }) => {
                                                                                                                                                                                                                                                                                                                                                                                                              if (session) {
                                                                                                                                                                                                                                                                                                                                                                                                                        setUser(session.user);
                                                                                                                                                                                                                                                                                                                                                                                                                                  setNeedsPassword(true);
                                                                                                                                                                                                                                                                                                                                                                                                                                            loadProfiles();
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                            setBooting(false);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        return;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                sb.auth.getSession().then(({data:{session}}:any)=>{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      if(session){setUser(session.user);loadProfiles();}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            setBooting(false);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    const {data:{subscription}}=sb.auth.onAuthStateChange((_:any,session:any)=>{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          setUser(session?.user||null);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if(session) loadProfiles();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        return ()=>subscription.unsubscribe();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          },[loadProfiles]);

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            const handlePasswordSet = () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                setNeedsPassword(false);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  };

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    return(
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <style>{CSS}</style>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    {booting
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ?<div className="loading-wrap">haus is loading...</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    :needsPassword
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ?<SetPasswordPage onDone={handlePasswordSet}/>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        :user
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ?<AppShell user={user} profiles={profiles} onSignOut={async()=>{await sb.auth.signOut();setUser(null);setProfiles([]);}}/>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                :<LoginPage onLogin={(u:any)=>{setUser(u);loadProfiles();}}/>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }