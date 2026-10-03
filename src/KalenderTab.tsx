import { useState, useEffect, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export function IconCalendar({ active }: any) {
  const col = active ? '#D4890A' : '#AAAAAA';
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="4" width="18" height="16" stroke={col} strokeWidth="1.5"/>
      <line x1="2" y1="9" x2="20" y2="9" stroke={col} strokeWidth="1.5"/>
      <line x1="7" y1="2" x2="7" y2="6" stroke={col} strokeWidth="1.5"/>
      <line x1="15" y1="2" x2="15" y2="6" stroke={col} strokeWidth="1.5"/>
      <rect x="5" y="12" width="3" height="3" fill={col}/>
      <rect x="9.5" y="12" width="3" height="3" fill={col}/>
      <rect x="14" y="12" width="3" height="3" fill={col}/>
      <rect x="5" y="16" width="3" height="3" fill={col}/>
      <rect x="9.5" y="16" width="3" height="3" fill={col}/>
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Profile { id: string; label: string; color: string; }

interface CalEvent {
  id: number;
  title: string;
  event_date: string;        // "YYYY-MM-DD"
  event_time: string | null; // "HH:MM:SS" or null
  event_end_date: string | null;
  event_end_time: string | null;
  location: string | null;
  details: string | null;
  is_anniversary: boolean;
  created_by: string | null;
  created_at: string;
}

interface UpcomingItem {
  key: string;
  event: CalEvent;
  displayDate: string;   // YYYY-MM-DD for this occurrence (differs from event_date for anniversaries)
  yearsCount?: number;   // for anniversaries: how many years since original date
}

interface Props {
  sb: SupabaseClient;
  user: any;
  profiles: Profile[];
}


// ── Constants ────────────────────────────────────────────────────────────────

const ANNIVERSARY_COLOR = '#5B8CF5'; // periwinkle — reserved in design system for this

const MONTH_DE  = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const MONTH_SHT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const DAY_SHORT = ['Mo','Di','Mi','Do','Fr','Sa','So'];

// ── Date helpers ─────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0'); }

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }

// Returns 0=Mon … 6=Sun (European week order)
function getFirstWeekday(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7; }

function fmtDateFull(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayNames = ['So','Mo','Di','Mi','Do','Fr','Sa'];
  const dow = new Date(y, m - 1, d).getDay();
  return `${dayNames[dow]}, ${d}. ${MONTH_SHT[m - 1]}. ${y}`;
}

function fmtTime(t: string | null) { return t ? t.slice(0, 5) : null; }

// Next occurrence of an anniversary on or after today
function nextAnniversary(event: CalEvent, today: string): UpcomingItem {
  const [origY, m, d] = event.event_date.split('-').map(Number);
  const [ty] = today.split('-').map(Number);
  let year = ty;
  if (`${year}-${pad(m)}-${pad(d)}` < today) year++;
  return {
    key: `ann-${event.id}`,
    event,
    displayDate: `${year}-${pad(m)}-${pad(d)}`,
    yearsCount: year - origY,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function KalenderTab({ sb, user, profiles }: Props) {
  const today = todayStr();
  const now   = new Date();

  // Data
  const [events,  setEvents]  = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Grid navigation
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // List
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Form
  const [formOpen,    setFormOpen]    = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [fTitle,       setFTitle]       = useState('');
  const [fDate,        setFDate]        = useState(today);
  const [fTime,        setFTime]        = useState('');
  const [fLoc,         setFLoc]         = useState('');
  const [fDetails,     setFDetails]     = useState('');
  const [fEndDate,     setFEndDate]     = useState('');
  const [fEndTime,     setFEndTime]     = useState('');
  const [fAnniv,       setFAnniv]       = useState(false);
  const [saving,       setSaving]       = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  // ── Color helper ───────────────────────────────────────────────────────────

  function dotColor(ev: CalEvent) {
    if (ev.is_anniversary) return ANNIVERSARY_COLOR;
    const p = profiles.find(p => p.id === ev.created_by);
    return p ? p.color : '#AAAAAA';
  }

  // ── Supabase ───────────────────────────────────────────────────────────────

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await sb.from('calendar_events').select('*').order('event_date');
    if (data) setEvents(data as CalEvent[]);
    setLoading(false);
  }

  useEffect(() => {
    const ch = sb.channel('kalender_rt')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'calendar_events' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setEvents(prev => prev.some(e => e.id === payload.new.id)
            ? prev
            : [...prev, payload.new as CalEvent].sort((a, b) => a.event_date.localeCompare(b.event_date)));
        }
        if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new as CalEvent : e));
        }
        if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(e => e.id !== payload.old.id));
        }
      }).subscribe();
    return () => { sb.removeChannel(ch); };
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────

  function openNew(date?: string) {
    setEditingEvent(null);
    setFTitle(''); setFDate(date || today); setFEndDate(''); setFTime(''); setFEndTime('');
    setFLoc(''); setFDetails(''); setFAnniv(false);
    setFormOpen(true);
    setTimeout(() => titleRef.current?.focus(), 50);
  }

  function openEdit(ev: CalEvent) {
    setEditingEvent(ev);
    setFTitle(ev.title); setFDate(ev.event_date); setFEndDate(ev.event_end_date || ''); setFTime(ev.event_time || ''); setFEndTime((ev as any).event_end_time || '');
    setFLoc(ev.location || ''); setFDetails(ev.details || ''); setFAnniv(ev.is_anniversary);
    setFormOpen(true);
    setExpandedKey(null);
    setTimeout(() => titleRef.current?.focus(), 50);
  }

  function closeForm() { setFormOpen(false); setEditingEvent(null); }

  async function save() {
    if (!fTitle.trim() || !fDate) return;
    setSaving(true);
    const row = {
      title: fTitle.trim(),
      event_date: fDate,
      event_time: fAnniv ? null : (fTime || null),
      event_end_date: fAnniv ? null : (fEndDate && fEndDate > fDate ? fEndDate : null),
      event_end_time: fAnniv ? null : (fEndDate && fEndDate > fDate && fEndTime ? fEndTime : null),
      location: fAnniv ? null : (fLoc.trim() || null),
      details: fDetails.trim() || null,
      is_anniversary: fAnniv,
      created_by: user?.id ?? null,
    };
    if (editingEvent) {
      const { data, error } = await sb.from('calendar_events').update(row).eq('id', editingEvent.id).select().single();
      if (!error && data) setEvents(prev => prev.map(e => e.id === (data as CalEvent).id ? data as CalEvent : e));
    } else {
      const { data, error } = await sb.from('calendar_events').insert(row).select().single();
      if (!error && data) setEvents(prev =>
        [...prev, data as CalEvent].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    }
    setSaving(false);
    closeForm();
  }

  async function deleteEvent(id: number) {
    await sb.from('calendar_events').delete().eq('id', id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setExpandedKey(null);
  }

  // ── Calendar grid data ─────────────────────────────────────────────────────

  const daysInMonth   = getDaysInMonth(viewYear, viewMonth);
  const firstWeekday  = getFirstWeekday(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

  // Map date → markers for the grid view
  const gridMarkers = new Map<string, { color: string; hollow: boolean }[]>();

  events.forEach(ev => {
    const marker = { color: dotColor(ev), hollow: ev.is_anniversary };
    if (ev.is_anniversary) {
      const [, m, d] = ev.event_date.split('-').map(Number);
      const dateStr = `${viewYear}-${pad(m)}-${pad(d)}`;
      const arr = gridMarkers.get(dateStr) || [];
      arr.push(marker);
      gridMarkers.set(dateStr, arr);
    } else {
      // Mark every day from start to end (clamped to current view month)
      const start = ev.event_date;
      const end = ev.event_end_date && ev.event_end_date > start ? ev.event_end_date : start;
      const monthStart = `${viewYear}-${pad(viewMonth + 1)}-01`;
      const monthEnd = `${viewYear}-${pad(viewMonth + 1)}-${pad(daysInMonth)}`;
      const from = start < monthStart ? monthStart : start;
      const to   = end   > monthEnd   ? monthEnd   : end;
      if (from <= to) {
        const cur = new Date(from + 'T00:00:00');
        const last = new Date(to + 'T00:00:00');
        while (cur <= last) {
          const ds = `${cur.getFullYear()}-${pad(cur.getMonth()+1)}-${pad(cur.getDate())}`;
          const arr = gridMarkers.get(ds) || [];
          arr.push(marker);
          gridMarkers.set(ds, arr);
          cur.setDate(cur.getDate() + 1);
        }
      }
    }
  });

  // ── Upcoming list data ─────────────────────────────────────────────────────

  const upcoming: UpcomingItem[] = [];
  events.forEach(ev => {
    if (ev.is_anniversary) {
      upcoming.push(nextAnniversary(ev, today));
    } else if (ev.event_date >= today) {
      upcoming.push({ key: `ev-${ev.id}`, event: ev, displayDate: ev.event_date });
    }
  });

  const filtered = selectedDate
  ? upcoming.filter(item => {
      const start = item.displayDate;
      const end = item.event.event_end_date && item.event.event_end_date > start
        ? item.event.event_end_date
        : start;
      return selectedDate >= start && selectedDate <= end;
    })
  : upcoming;

  filtered.sort((a, b) => {
    const dc = a.displayDate.localeCompare(b.displayDate);
    if (dc !== 0) return dc;
    return (a.event.event_time || '99:99').localeCompare(b.event.event_time || '99:99');
  });

  // Group by "YYYY-MM"
  const monthGroups = new Map<string, UpcomingItem[]>();
  filtered.forEach(item => {
    const mk = item.displayDate.slice(0, 7);
    const arr = monthGroups.get(mk) || [];
    arr.push(item);
    monthGroups.set(mk, arr);
  });
  const monthKeys = Array.from(monthGroups.keys()).sort();

  // ── Design tokens ──────────────────────────────────────────────────────────

  const c = {
    bg: '#FFFFFF', surface: '#F5F5F5', border: '#E0E0E0', borderStrong: '#111111',
    text: '#111111', textSub: '#555555', textMuted: '#AAAAAA',
    amber: '#D4890A', amberBg: '#FFF4E0', amberText: '#8A5500',
    urgent: '#DC2626',
  };
  const mono = 'DM Mono, monospace';
  const sans = 'DM Sans, sans-serif';

  // ── Month nav helpers ──────────────────────────────────────────────────────

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: c.bg, minHeight: '100%', paddingBottom: 100 }}>

      {/* ── Add row ─────────────────────────────────────────────────────────── */}
      {!formOpen ? (
        <div
          onClick={() => openNew(selectedDate || undefined)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 16px', borderBottom: `1.5px solid ${c.borderStrong}`,
            cursor: 'pointer', background: c.surface,
          }}
        >
          <span style={{ fontFamily: mono, fontSize: 18, color: c.textMuted, lineHeight: 1 }}>+</span>
          <span style={{ fontFamily: sans, fontSize: 15, color: c.textMuted }}>Termin hinzufügen…</span>
        </div>
      ) : (
        /* ── Form (expanded) ──────────────────────────────────────────────── */
        <div style={{ borderBottom: `1.5px solid ${c.borderStrong}`, background: c.amberBg, padding: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.amberText, marginBottom: 10 }}>
            {editingEvent ? 'Termin bearbeiten' : 'Neuer Termin'}
          </div>

          {/* Title */}
          <input
            ref={titleRef}
            value={fTitle}
            onChange={e => setFTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && save()}
            placeholder="Was? (Pflichtfeld)"
            style={{ width: '100%', border: `1.5px solid ${c.borderStrong}`, background: '#fff', padding: '8px 10px', fontFamily: sans, fontSize: 15, color: c.text, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
          />

          {/* Date + Time (time hidden for anniversaries) */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="date"
              value={fDate}
              onChange={e => setFDate(e.target.value)}
              style={{ flex: 2, border: `1.5px solid ${c.border}`, background: '#fff', padding: '7px 10px', fontFamily: mono, fontSize: 13, color: c.text, outline: 'none' }}
            />
            {!fAnniv && (
              <input
                type="time"
                value={fTime}
                onChange={e => setFTime(e.target.value)}
                placeholder="Zeit"
                style={{ flex: 1, border: `1.5px solid ${c.border}`, background: '#fff', padding: '7px 10px', fontFamily: mono, fontSize: 13, color: c.text, outline: 'none' }}
              />
            )}
          </div>
 {/* End date — multi-day events */}

{!fAnniv && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: c.textMuted, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>bis</span>
              <input
                type="date"
                value={fEndDate}
                min={fDate}
                onChange={e => { setFEndDate(e.target.value); if (!e.target.value) setFEndTime(''); }}
                style={{ flex: 2, border: `1.5px solid ${fEndDate ? c.borderStrong : c.border}`, background: '#fff', padding: '7px 10px', fontFamily: mono, fontSize: 13, color: c.text, outline: 'none' }}
              />
              {fEndDate && (
                <input
                  type="time"
                  value={fEndTime}
                  onChange={e => setFEndTime(e.target.value)}
                  style={{ flex: 1, border: `1.5px solid ${c.border}`, background: '#fff', padding: '7px 10px', fontFamily: mono, fontSize: 13, color: c.text, outline: 'none' }}
                />
              )}
              {fEndDate && (
                <button onClick={() => { setFEndDate(''); setFEndTime(''); }} style={{ background: 'none', border: `1.5px solid ${c.border}`, color: c.textMuted, fontFamily: mono, fontSize: 10, padding: '7px 8px', cursor: 'pointer' }}>✕</button>
              )}
            </div>
          )}

          {/* Location (hidden for anniversaries) */}
          {!fAnniv && (
            <input
              value={fLoc}
              onChange={e => setFLoc(e.target.value)}
              placeholder="Wo? (optional)"
              style={{ width: '100%', border: `1.5px solid ${c.border}`, background: '#fff', padding: '7px 10px', fontFamily: sans, fontSize: 14, color: c.text, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
            />
          )}

          {/* Details */}
          <input
            value={fDetails}
            onChange={e => setFDetails(e.target.value)}
            placeholder="Details (optional)"
            style={{ width: '100%', border: `1.5px solid ${c.border}`, background: '#fff', padding: '7px 10px', fontFamily: sans, fontSize: 14, color: c.text, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
          />

          {/* Anniversary toggle */}
          <div
            onClick={() => setFAnniv(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 12 }}
          >
            <div style={{ width: 36, height: 20, borderRadius: 10, background: fAnniv ? ANNIVERSARY_COLOR : c.border, position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: fAnniv ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.06em', color: fAnniv ? ANNIVERSARY_COLOR : c.textSub }}>
              GEBURTSTAG / JAHRESTAG (jährlich wiederkehrend)
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={save}
              disabled={!fTitle.trim() || !fDate || saving}
              style={{ flex: 1, background: fTitle.trim() ? c.amber : c.border, border: 'none', color: fTitle.trim() ? '#fff' : c.textMuted, fontFamily: mono, fontSize: 12, letterSpacing: '0.06em', padding: 9, cursor: fTitle.trim() ? 'pointer' : 'default', fontWeight: 600 }}
            >
              {saving ? '…' : editingEvent ? 'SPEICHERN' : 'HINZUFÜGEN'}
            </button>
            <button
              onClick={closeForm}
              style={{ border: `1.5px solid ${c.border}`, background: 'none', color: c.textSub, fontFamily: mono, fontSize: 12, letterSpacing: '0.06em', padding: '9px 14px', cursor: 'pointer' }}
            >
              ABB.
            </button>
          </div>
        </div>
      )}

      {/* ── Month grid ──────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `1.5px solid ${c.border}`, paddingBottom: 8 }}>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 6px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 20, color: c.text, padding: '0 6px', lineHeight: 1 }}>‹</button>
          <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.text }}>
            {MONTH_DE[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 20, color: c.text, padding: '0 6px', lineHeight: 1 }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 10px', marginBottom: 2 }}>
          {DAY_SHORT.map(d => (
            <div key={d} style={{ textAlign: 'center', fontFamily: mono, fontSize: 10, color: c.textMuted, letterSpacing: '0.06em' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 6px' }}>

          {/* Filler from prev month */}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`p${i}`} style={{ textAlign: 'center', padding: '3px 1px', opacity: 0.2 }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: c.text }}>{prevMonthDays - firstWeekday + 1 + i}</span>
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day     = i + 1;
            const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
            const isToday    = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const isPast     = dateStr < today;
            const markers    = gridMarkers.get(dateStr) || [];

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '3px 1px', cursor: 'pointer' }}
              >
                {/* Day number */}
                <div style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSelected ? c.amber : 'transparent',
                  border: isToday && !isSelected ? `1.5px solid ${c.amber}` : '1.5px solid transparent',
                }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: isSelected ? '#fff' : isPast ? c.textMuted : c.text, fontWeight: isToday ? 700 : 400 }}>
                    {day}
                  </span>
                </div>

                {/* Event markers */}
                {markers.length > 0 && (
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 22 }}>
                    {markers.slice(0, 3).map((mk, mi) =>
                      mk.hollow
                        ? <div key={mi} style={{ width: 5, height: 5, borderRadius: '50%', border: `1.5px solid ${mk.color}` }} />
                        : <div key={mi} style={{ width: 5, height: 5, borderRadius: '50%', background: mk.color }} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, padding: '6px 16px 2px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', border: `1.5px solid ${ANNIVERSARY_COLOR}` }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: c.textMuted, letterSpacing: '0.06em' }}>JAHRESTAG</span>
          </div>
          {profiles.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.color }} />
              <span style={{ fontFamily: mono, fontSize: 9, color: c.textMuted, letterSpacing: '0.06em' }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Upcoming list ────────────────────────────────────────────────────── */}

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px 6px', borderBottom: `1.5px solid ${c.border}` }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted }}>
          {selectedDate ? fmtDateFull(selectedDate) : 'DEMNÄCHST'}
        </span>
        {selectedDate && (
           <button
           onClick={() => setSelectedDate(null)}
           style={{ background: c.amberBg, border: `1.5px solid ${c.amber}`, cursor: 'pointer', fontFamily: mono, fontSize: 9, color: c.amberText, padding: '3px 10px', letterSpacing: '0.06em', fontWeight: 600 }}
         >
           ALLE ZEIGEN
         </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', fontFamily: mono, fontSize: 11, color: c.textMuted, letterSpacing: '0.06em' }}>LADEN…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', fontFamily: mono, fontSize: 11, color: c.textMuted, letterSpacing: '0.06em' }}>
          {selectedDate ? 'KEIN TERMIN AN DIESEM TAG' : 'KEINE BEVORSTEHENDEN TERMINE'}
        </div>
      ) : (
        monthKeys.map(mk => {
          const [y, m]    = mk.split('-').map(Number);
          const items     = monthGroups.get(mk) || [];
          const isThisMo  = y === now.getFullYear() && m === now.getMonth() + 1;

          return (
            <div key={mk}>
              {/* Month group header */}
              <div style={{ padding: '8px 16px 4px', background: c.surface, borderBottom: `1.5px solid ${c.border}`, borderTop: `1.5px solid ${c.border}` }}>
                <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: isThisMo ? c.amber : c.textSub, fontWeight: isThisMo ? 700 : 400 }}>
                  {MONTH_DE[m - 1]} {y}
                </span>
              </div>

              {/* Event rows */}
              {items.map(item => {
                const ev        = item.event;
                const isExp     = expandedKey === item.key;
                const color     = dotColor(ev);
                const [, mo, d] = item.displayDate.split('-').map(Number);
                const dow       = new Date(Number(item.displayDate.slice(0, 4)), mo - 1, d).getDay();
                const dayNames  = ['So','Mo','Di','Mi','Do','Fr','Sa'];
                const shortDate = `${dayNames[dow]} ${d}. ${MONTH_SHT[mo - 1]}`;
                const isItemToday = item.displayDate === today;

                return (
                  <div key={item.key} style={{ borderBottom: `1.5px solid ${c.border}` }}>

                    {/* Collapsed row */}
                    <div
                      onClick={() => setExpandedKey(isExp ? null : item.key)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', cursor: 'pointer', background: isExp ? c.amberBg : c.bg }}
                    >
                      {/* Type / owner marker */}
                      {ev.is_anniversary
                        ? <div style={{ width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0 }} />
                        : <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      }

                      {/* Title */}
                      <span style={{ flex: 1, fontFamily: sans, fontSize: 15, color: c.text }}>
                        {ev.title}
                        {ev.is_anniversary && typeof item.yearsCount === 'number' && item.yearsCount > 0 && (
                          <span style={{ fontFamily: mono, fontSize: 10, color: ANNIVERSARY_COLOR, marginLeft: 6 }}>· {item.yearsCount} J</span>
                        )}
                      </span>

                      {/* Date + time */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                       <span style={{ fontFamily: mono, fontSize: 10, color: isItemToday ? c.amber : c.textSub, fontWeight: isItemToday ? 700 : 400 }}>
                          {isItemToday ? 'HEUTE' : shortDate}
                          {ev.event_end_date && ev.event_end_date > ev.event_date && (() => {
                            const [ey, em, ed] = ev.event_end_date.split('-').map(Number);
                            const edow = new Date(ey, em-1, ed).getDay();
                            const dayNames = ['So','Mo','Di','Mi','Do','Fr','Sa'];
                            return <span style={{ color: c.textMuted }}> – {dayNames[edow]} {ed}. {MONTH_SHT[em-1]}</span>;
                          })()}
                        </span>
                        {fmtTime(ev.event_time) && (
                          <span style={{ fontFamily: mono, fontSize: 10, color: c.textMuted }}>{fmtTime(ev.event_time)}</span>
                        )}
                      </div>

                      <span style={{ fontFamily: mono, fontSize: 11, color: c.textMuted, marginLeft: 4 }}>{isExp ? '▲' : '▼'}</span>
                    </div>

                    {/* Expanded details */}
                    {isExp && (
                      <div style={{ padding: '2px 16px 12px 34px', background: c.amberBg, borderTop: `1.5px solid ${c.border}` }}>
                        {fmtTime(ev.event_time) && (
                          <div style={{ fontFamily: mono, fontSize: 12, color: c.textSub, marginTop: 8 }}>🕐 {fmtTime(ev.event_time)} Uhr</div>
                        )}
                        {ev.is_anniversary && (
                          <div style={{ fontFamily: mono, fontSize: 10, color: ANNIVERSARY_COLOR, marginTop: 6, letterSpacing: '0.06em' }}>🎂 Jährlich wiederkehrend</div>
                        )}
                        {ev.location && (
                          <div style={{ fontFamily: sans, fontSize: 13, color: c.textSub, marginTop: 6 }}>📍 {ev.location}</div>
                        )}
                        {ev.details && (
                          <div style={{ fontFamily: sans, fontSize: 13, color: c.textSub, marginTop: 6, lineHeight: 1.5 }}>{ev.details}</div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(ev); }}
                            style={{ border: `1.5px solid ${c.border}`, background: '#fff', color: c.textSub, fontFamily: mono, fontSize: 10, letterSpacing: '0.06em', padding: '5px 10px', cursor: 'pointer' }}
                          >
                            BEARBEITEN
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                            style={{ border: `1.5px solid ${c.urgent}`, background: 'none', color: c.urgent, fontFamily: mono, fontSize: 10, letterSpacing: '0.06em', padding: '5px 10px', cursor: 'pointer' }}
                          >
                            LÖSCHEN
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
