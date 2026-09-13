import { useState, useEffect, useRef } from 'react';
import {
  GANG_INTRO,
  CATS,
  ROUTINE,
  FEEDING,
  LITTER,
  PLAY,
  WHERE_IT_LIVES,
  HOUSE,
  CONTACTS,
} from './catsContent';

/* ── tokens (mirrors the haus design system) ───────────────────── */
const C = {
  text: '#111111',
  text2: '#555555',
  muted: '#AAAAAA',
  border: '#E0E0E0',
  alt: '#F5F5F5',
  amber: '#D4890A',
  amberBg: '#FFF4E0',
  amberText: '#8A5500',
  urgent: '#DC2626',
  urgentBg: '#FEF2F2',
  green: '#1A8A4A',
};

/* The jump bar. Order here must match the sections rendered below;
   `id` is the anchor, `label` is what shows in the bar.            */
const SECTIONS = [
  { id: 'gang', label: 'gang' },
  { id: 'visit', label: 'visit' },
  { id: 'feeding', label: 'food' },
  { id: 'litter', label: 'litter' },
  { id: 'play', label: 'play' },
  { id: 'where', label: 'where' },
  { id: 'house', label: 'safety' },
  { id: 'contacts', label: 'help' },
];

/* ── cat-themed CSS, injected alongside the app's own ──────────── */
export const CATS_CSS = `
.cat-jump{position:sticky;top:0;z-index:120;background:rgba(255,255,255,.97);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1.5px solid #111111;margin:0 -24px 30px;padding:0 18px;display:flex;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
.cat-jump::-webkit-scrollbar{display:none}
.cat-jump button{flex:0 0 auto;background:none;border:none;cursor:pointer;padding:14px 11px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#AAAAAA;white-space:nowrap;position:relative;transition:color .12s}
.cat-jump button:hover{color:#555555}
.cat-jump button.on{color:#111111}
.cat-jump button.on::after{content:'';position:absolute;left:11px;right:11px;bottom:0;height:2px;background:#D4890A}
.cat-sec{margin-bottom:56px;scroll-margin-top:60px}
.cat-sechead{display:flex;align-items:baseline;gap:12px;padding-bottom:12px;border-bottom:1.5px solid #111111;margin-bottom:24px}
.cat-secnum{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.14em;color:#D4890A}
.cat-sectitle{font-family:'DM Sans',sans-serif;font-size:21px;font-weight:600;letter-spacing:-.02em;color:#111111;line-height:1}
.cat-sechint{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#AAAAAA;margin:-14px 0 20px;display:flex;align-items:center;gap:8px}
.cat-secsub{font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.65;color:#555555;margin-bottom:24px}
.cat-card{border:1.5px solid #111111;margin-bottom:16px;background:#fff}
.cat-cardtop{display:flex;gap:14px;padding:14px;border-bottom:1px solid #E0E0E0}
.cat-name{font-family:'DM Sans',sans-serif;font-size:22px;font-weight:600;letter-spacing:-.03em;color:#111111;line-height:1.05}
.cat-nick{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.08em;color:#AAAAAA;margin-top:6px;line-height:1.6}
.cat-meta{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#555555;margin-top:8px}
.cat-one{font-family:'DM Sans',sans-serif;font-size:15.5px;line-height:1.6;color:#111111;padding:14px;border-bottom:1px solid #E0E0E0;background:#FAFAFA}
.cat-list{list-style:none;padding:12px 14px}
.cat-list li{display:flex;gap:9px;font-family:'DM Sans',sans-serif;font-size:14.5px;line-height:1.6;color:#555555;padding:6px 0}
.cat-list li svg{flex-shrink:0;margin-top:5px}
.cat-cols{display:flex;flex-wrap:wrap;gap:0;border-top:1px solid #E0E0E0}
.cat-col{flex:1 1 200px;min-width:0;padding:12px 14px}
.cat-col+.cat-col{border-left:1px solid #E0E0E0}
.cat-collabel{font-family:'DM Mono',monospace;font-size:9px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;margin-bottom:9px}
.cat-colitem{font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.55;color:#555555;padding:5px 0 5px 12px;position:relative}
.cat-colitem::before{content:'';position:absolute;left:0;top:12px;width:5px;height:1.5px;background:#AAAAAA}
.cat-note{display:flex;gap:11px;padding:14px;border:1.5px solid;margin-bottom:10px}
.cat-note-t{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;letter-spacing:-.01em;margin-bottom:5px}
.cat-note-b{font-family:'DM Sans',sans-serif;font-size:14.5px;line-height:1.6}
.cat-step{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid #E0E0E0}
.cat-step:first-child{border-top:1px solid #E0E0E0}
.cat-stepnum{width:26px;height:26px;flex-shrink:0;border:1.5px solid #E0E0E0;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:11px;color:#AAAAAA}
.cat-stept{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;letter-spacing:-.01em;color:#111111;line-height:1.35}
.cat-stepd{font-family:'DM Sans',sans-serif;font-size:14.5px;line-height:1.6;color:#555555;margin-top:5px}
.cat-jumplink{display:inline-flex;align-items:center;gap:7px;margin-top:11px;background:none;border:1.5px solid #E0E0E0;cursor:pointer;padding:7px 12px;font-family:'DM Mono',monospace;font-size:9.5px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#8A5500;transition:border-color .12s,background .12s}
.cat-jumplink:hover{border-color:#D4890A;background:#FFF4E0}
.cat-where{display:flex;gap:14px;padding:12px;border:1.5px solid #E0E0E0;margin-bottom:10px;background:#fff}
.cat-wherelabel{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;letter-spacing:-.01em;color:#111111}
.cat-whereplace{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#D4890A;margin-top:4px;line-height:1.5}
.cat-wheretext{font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.55;color:#555555;margin-top:7px}
.cat-photo{background:#F5F5F5;border:1.5px dashed #E0E0E0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;flex-shrink:0;overflow:hidden;padding:0;position:relative}
.cat-photo img{width:100%;height:100%;object-fit:cover;display:block}
.cat-photo.fit img{object-fit:contain}
.cat-photo.tappable{cursor:zoom-in;border-style:solid;border-color:#111111}
.cat-zoomtag{position:absolute;right:0;bottom:0;width:22px;height:22px;background:rgba(17,17,17,.74);display:flex;align-items:center;justify-content:center;pointer-events:none}
.cat-photocap{font-family:'DM Mono',monospace;font-size:7.5px;letter-spacing:.1em;text-transform:uppercase;color:#AAAAAA;text-align:center;padding:0 4px;line-height:1.4}
.cat-lightbox{position:fixed;inset:0;background:rgba(17,17,17,.94);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;cursor:zoom-out}
.cat-lightbox img{max-width:100%;max-height:80vh;object-fit:contain}
.cat-lightbox span{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45)}
.cat-hero{display:flex;gap:10px;margin-bottom:22px}
.cat-heropick{flex:1;min-width:0;background:none;border:none;padding:0;cursor:pointer;text-align:center;opacity:.4;transition:opacity .15s}
.cat-heropick.on{opacity:1}
.cat-heropick .cat-photo{width:100%;height:92px}
.cat-heropick.on .cat-photo{border-style:solid;border-color:#111111}
.cat-heroname{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;letter-spacing:-.01em;color:#AAAAAA;margin-top:8px}
.cat-heropick.on .cat-heroname{color:#111111}
.cat-herobar{height:3px;margin-top:6px;background:#E0E0E0}
.cat-heropick.on .cat-herobar{height:6px}
.cat-quote{border-left:2.5px solid #D4890A;background:#FFFDF7;padding:15px 16px;font-family:'DM Sans',sans-serif;font-size:14.5px;line-height:1.65;color:#555555;margin-top:18px}
.cat-contact{border:1.5px solid #111111;padding:14px;margin-bottom:10px}
.cat-tagline{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#AAAAAA}
.cat-paws{display:flex;gap:10px;justify-content:center;margin:6px 0}
@media(max-width:420px){.cat-col+.cat-col{border-left:none;border-top:1px solid #E0E0E0}}
`;

/* ── icons ─────────────────────────────────────────────────────── */

export const IconCat = ({ active }: any) => {
  const s = active ? C.amber : C.muted;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.5"
      stroke={s} strokeLinecap="square" strokeLinejoin="miter">
      <path d="M4 9 L4 3 L8 6.2" />
      <path d="M18 9 L18 3 L14 6.2" />
      <path d="M4 9 C4 15.5 6.6 19 11 19 C15.4 19 18 15.5 18 9" />
      <rect x="8" y="11" width="1.4" height="1.4" fill={s} stroke="none" />
      <rect x="12.6" y="11" width="1.4" height="1.4" fill={s} stroke="none" />
      <path d="M11 14.4 L11 15.6" />
    </svg>
  );
};

const Paw = ({ size = 9, color = C.amber }: any) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill={color}>
    <circle cx="2" cy="3" r="1.15" />
    <circle cx="5" cy="2.1" r="1.15" />
    <circle cx="8" cy="3" r="1.15" />
    <ellipse cx="5" cy="6.6" rx="2.6" ry="2.1" />
  </svg>
);

/* corner mark that says "this opens bigger" */
const IconExpand = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#fff"
    strokeWidth="1.4" strokeLinecap="square">
    <path d="M1 4.5V1h3.5M11 7.5V11H7.5" />
    <path d="M1 1l3.6 3.6M11 11L7.4 7.4" />
  </svg>
);

const IconJump = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={C.amberText}
    strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M6 1.5v9M6 10.5L2.5 7M6 10.5L9.5 7" />
  </svg>
);

/* Cat head logo — same construction language as HausLogo */
export function CatLogo({ size = 64 }: any) {
  const s = size, cx = s / 2, cy = s * 0.56, r = s * 0.34;
  const dots = CATS.map((c: any) => c.color);
  const dr = s * 0.088, ov = dr * 0.35, st = dr * 2 - ov;
  const tw = dots.length * dr * 2 - (dots.length - 1) * ov;
  const sx = cx - tw / 2 + dr, dy = cy + r * 0.42;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <path
        d={`M ${cx - r * 0.88} ${cy - r * 0.52} L ${cx - r * 0.82} ${s * 0.1} L ${cx - r * 0.2} ${cy - r * 0.86}`}
        stroke={C.text} strokeWidth="1.5" strokeLinejoin="miter" strokeLinecap="square" />
      <path
        d={`M ${cx + r * 0.88} ${cy - r * 0.52} L ${cx + r * 0.82} ${s * 0.1} L ${cx + r * 0.2} ${cy - r * 0.86}`}
        stroke={C.text} strokeWidth="1.5" strokeLinejoin="miter" strokeLinecap="square" />
      <circle cx={cx} cy={cy} r={r} stroke={C.text} strokeWidth="1.5" fill="none" />
      <clipPath id="catclip"><circle cx={cx} cy={cy} r={r} /></clipPath>
      <g clipPath="url(#catclip)">
        {dots.map((col: any, i: number) => (
          <circle key={i} cx={sx + i * st} cy={dy} r={dr} fill={col} opacity={0.9} />
        ))}
      </g>
      <rect x={cx - r * 0.44} y={cy - r * 0.18} width="1.6" height="1.6" fill={C.text} />
      <rect x={cx + r * 0.3} y={cy - r * 0.18} width="1.6" height="1.6" fill={C.text} />
    </svg>
  );
}

/* ── navigation ────────────────────────────────────────────────── */

const jumpTo = (id: string) => {
  const el = document.getElementById('s-' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* Highlights whichever section is currently under the jump bar. */
function useActiveSection() {
  const [active, setActive] = useState(SECTIONS[0].id);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = SECTIONS
      .map((s) => document.getElementById('s-' + s.id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries: any) => {
        const visible = entries
          .filter((e: any) => e.isIntersecting)
          .sort((a: any, b: any) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id.replace('s-', ''));
      },
      { rootMargin: '-60px 0px -68% 0px', threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return active;
}

function JumpBar({ active }: any) {
  const bar = useRef<HTMLDivElement | null>(null);
  // keep the highlighted chip in view without moving the page itself
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const chip = el.querySelector(`[data-chip="${active}"]`) as HTMLElement | null;
    if (chip) el.scrollTo({ left: Math.max(0, chip.offsetLeft - 60), behavior: 'smooth' });
  }, [active]);
  return (
    <div className="cat-jump" ref={bar}>
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          data-chip={s.id}
          className={active === s.id ? 'on' : ''}
          onClick={() => jumpTo(s.id)}
        >{s.label}</button>
      ))}
    </div>
  );
}

/* ── primitives ────────────────────────────────────────────────── */

function SectionHead({ num, title }: any) {
  return (
    <div className="cat-sechead">
      <span className="cat-secnum">{num}</span>
      <span className="cat-sectitle">{title}</span>
      <div style={{ flex: 1 }} />
      <Paw size={11} color={C.border} />
    </div>
  );
}

function PhotoSlot({ src, caption, w = 96, h = 96, onZoom, fit }: any) {
  const tappable = Boolean(src && onZoom);
  return (
    <div
      className={`cat-photo${tappable ? ' tappable' : ''}${fit ? ' fit' : ''}`}
      style={{ width: w, height: h }}
      onClick={tappable ? () => onZoom(src) : undefined}
      title={tappable ? 'Tap to enlarge' : undefined}
    >
      {src ? (
        <>
          <img src={src} alt={caption} />
          {tappable && <span className="cat-zoomtag"><IconExpand /></span>}
        </>
      ) : (
        <>
          <Paw size={16} color="#D8D8D8" />
          <span className="cat-photocap">{caption}</span>
        </>
      )}
    </div>
  );
}

function Lightbox({ src, onClose }: any) {
  useEffect(() => {
    const esc = (e: any) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  if (!src) return null;
  return (
    <div className="cat-lightbox" onClick={onClose}>
      <img src={src} alt="" />
      <span>tap anywhere to close</span>
    </div>
  );
}

const NOTE_STYLE: any = {
  alert: { border: C.urgent, bg: C.urgentBg, title: C.urgent, body: '#8A1F1F', mark: '!' },
  warn: { border: C.amber, bg: C.amberBg, title: C.amberText, body: '#6B4400', mark: '·' },
  info: { border: C.border, bg: '#fff', title: C.text, body: C.text2, mark: '·' },
};

function Note({ level = 'info', title, text }: any) {
  const s = NOTE_STYLE[level] || NOTE_STYLE.info;
  return (
    <div className="cat-note" style={{ borderColor: s.border, background: s.bg }}>
      <span style={{
        fontFamily: "'DM Mono',monospace", fontSize: 15, fontWeight: 500,
        color: s.title, lineHeight: 1.4, width: 10, flexShrink: 0, textAlign: 'center',
      }}>{s.mark}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cat-note-t" style={{ color: s.title }}>{title}</div>
        <div className="cat-note-b" style={{ color: s.body }}>{text}</div>
      </div>
    </div>
  );
}

function Steps({ items }: any) {
  return (
    <div style={{ marginBottom: 20 }}>
      {items.map((s: any, i: number) => (
        <div className="cat-step" key={i}>
          <div className="cat-stepnum">{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="cat-stept">{s.title}</div>
            <div className="cat-stepd">{s.detail}</div>
            {s.jumpTo && (
              <button type="button" className="cat-jumplink" onClick={() => jumpTo(s.jumpTo)}>
                <IconJump />{s.jumpLabel || 'See more'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CatCard({ cat }: any) {
  return (
    <div className="cat-card" style={{ borderLeft: `4px solid ${cat.color}` }}>
      <div className="cat-cardtop">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cat-name">{cat.name}</div>
          <div className="cat-nick">{cat.nicknames}</div>
          <div className="cat-meta">{cat.age} · {cat.coat}</div>
        </div>
      </div>
      <div className="cat-one">{cat.oneLiner}</div>
      <ul className="cat-list">
        {cat.traits.map((tr: string, i: number) => (
          <li key={i}><Paw size={8} color={cat.color} />{tr}</li>
        ))}
      </ul>
      <div className="cat-cols">
        <div className="cat-col">
          <div className="cat-collabel" style={{ color: C.green }}>loves</div>
          {cat.loves.map((l: string, i: number) => (
            <div className="cat-colitem" key={i}>{l}</div>
          ))}
        </div>
        <div className="cat-col">
          <div className="cat-collabel" style={{ color: C.urgent }}>good to know</div>
          {cat.avoid.map((l: string, i: number) => (
            <div className="cat-colitem" key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── the page ──────────────────────────────────────────────────── */

export default function CatsTab() {
  const [picked, setPicked] = useState(CATS[0].id);
  const [zoom, setZoom] = useState<string | null>(null);
  const active = useActiveSection();

  const catById = (id: string) => CATS.find((c: any) => c.id === id);
  const current = catById(picked) || CATS[0];

  return (
    <div>
      <Lightbox src={zoom} onClose={() => setZoom(null)} />
      <JumpBar active={active} />

      {/* 01 — THE GANG */}
      <section className="cat-sec" id="s-gang">
        <SectionHead num="01" title="the gang" />
        <div className="cat-hero">
          {CATS.map((c: any) => {
            const on = c.id === picked;
            return (
              <button
                key={c.id}
                type="button"
                className={`cat-heropick${on ? ' on' : ''}`}
                onClick={() => setPicked(c.id)}
                aria-pressed={on}
              >
                <PhotoSlot src={c.photo} caption={c.name.toLowerCase()} w="100%" h={92} />
                <div className="cat-heroname">{c.name}</div>
                <div className="cat-herobar" style={on ? { background: c.color } : undefined} />
              </button>
            );
          })}
        </div>
        <div className="cat-sechint"><Paw size={9} color={C.muted} /> tap a name to switch</div>
        <div className="cat-secsub">{GANG_INTRO}</div>
        <CatCard cat={current} />
      </section>

      {/* 02 — A VISIT IN 5 STEPS */}
      <section className="cat-sec" id="s-visit">
        <SectionHead num="02" title="a visit in 5 steps" />
        <div className="cat-secsub">{ROUTINE.note}</div>
        <Steps items={ROUTINE.steps} />
        <div className="cat-quote">{ROUTINE.photosNote}</div>
      </section>

      {/* 03 — FEEDING */}
      <section className="cat-sec" id="s-feeding">
        <SectionHead num="03" title="feeding" />
        {FEEDING.rules.map((r: any, i: number) => <Note key={i} {...r} />)}
      </section>

      {/* 04 — LITTER */}
      <section className="cat-sec" id="s-litter">
        <SectionHead num="04" title="litter" />
        <Steps items={LITTER.steps} />
        {LITTER.rules.map((r: any, i: number) => <Note key={i} {...r} />)}
      </section>

      {/* 05 — PLAY & CUDDLES */}
      <section className="cat-sec" id="s-play">
        <SectionHead num="05" title="play & cuddles" />
        <Steps items={PLAY.general} />
        <div className="cat-sechint"><Paw size={9} color={C.muted} /> one by one</div>
        {PLAY.perCat.map((p: any) => {
          const c = catById(p.catId);
          if (!c) return null;
          return (
            <div key={p.catId} className="cat-where" style={{ borderLeft: `4px solid ${c.color}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cat-wherelabel">{c.name}</div>
                <div className="cat-wheretext">{p.text}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 06 — WHERE EVERYTHING LIVES */}
      <section className="cat-sec" id="s-where">
        <SectionHead num="06" title="where everything lives" />
        <div className="cat-sechint">
          <Paw size={9} color={C.muted} /> tap any photo to see it full screen
        </div>
        {WHERE_IT_LIVES.map((w: any, i: number) => (
          <div className="cat-where" key={i}>
            <PhotoSlot
              src={w.photo}
              caption={w.label.toLowerCase()}
              w={104}
              h={104}
              onZoom={setZoom}
              fit
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cat-wherelabel">{w.label}</div>
              <div className="cat-whereplace">{w.place}</div>
              <div className="cat-wheretext">{w.text}</div>
            </div>
          </div>
        ))}
      </section>

      {/* 07 — HOUSE QUIRKS */}
      <section className="cat-sec" id="s-house">
        <SectionHead num="07" title="house quirks & safety" />
        <div className="cat-secsub">{HOUSE.intro}</div>
        {HOUSE.warnings.map((w: any, i: number) => <Note key={i} {...w} />)}
      </section>

      {/* 08 — EMERGENCY & CONTACTS */}
      <section className="cat-sec" id="s-contacts">
        <SectionHead num="08" title="emergency & contacts" />

        {CONTACTS.people.map((p: any, i: number) => (
          <div className="cat-contact" key={i}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="cat-wherelabel" style={{ fontSize: 17 }}>{p.name}</span>
              <span className="cat-tagline">{p.role}</span>
            </div>
            {p.lines.map((l: string, j: number) => (
              <div className="cat-colitem" key={j}>{l}</div>
            ))}
            {p.phone && (
              <a href={`tel:${p.phone}`} style={{
                display: 'inline-block', marginTop: 10, fontFamily: "'DM Mono',monospace",
                fontSize: 13, letterSpacing: '.06em', color: C.amber, textDecoration: 'none',
                border: `1.5px solid ${C.amber}`, padding: '8px 14px',
              }}>{p.phone}</a>
            )}
          </div>
        ))}

        <Note level="alert" title={CONTACTS.vet.title} text={CONTACTS.vet.emergency} />
        <Note level="info" title="Routine vet — Felmo" text={CONTACTS.vet.regular} />

        <div className="cat-paws" style={{ marginTop: 32 }}>
          {CATS.map((c: any) => <Paw key={c.id} size={12} color={c.color} />)}
        </div>
      </section>
    </div>
  );
}

/* ── guest login (password only) ───────────────────────────────── */

export function GuestLoginPage({ onSubmit }: any) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError('');
    const err = await onSubmit(pw);
    if (err) {
      setError('that password did not work — check the message we sent you');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 48,
        }}>
          <CatLogo size={76} />
          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: 38, fontWeight: 300,
            letterSpacing: '-0.05em', color: C.text, marginTop: 16, lineHeight: 1,
          }}>the cats</div>
          <div className="label" style={{ marginTop: 12, letterSpacing: '0.2em' }}>
            boris · chapo · sora
          </div>
        </div>

        <div style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: 15, lineHeight: 1.65,
          color: C.text2, textAlign: 'center', marginBottom: 24,
        }}>
          Welcome, and thank you for looking after them.<br />
          Enter the password we sent you.
        </div>

        <div style={{ position: 'relative' }}>
          <input
            className="login-field"
            type={show ? 'text' : 'password'}
            placeholder="password"
            value={pw}
            autoFocus
            autoComplete="current-password"
            onChange={(e) => { setPw(e.target.value); setError(''); }}
            onKeyDown={(e: any) => e.key === 'Enter' && submit()}
            style={{ paddingRight: 56 }}
          />
          <button
            onClick={() => setShow((p) => !p)}
            tabIndex={-1}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Mono',monospace", fontSize: 9, color: C.muted,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >{show ? 'hide' : 'show'}</button>
        </div>

        {error && <div className="login-error" style={{ marginTop: 6 }}>{error}</div>}

        <button
          className="login-btn"
          style={{ marginTop: 6 }}
          onClick={submit}
          disabled={!pw.trim() || loading}
        >{loading ? 'letting you in...' : 'let me in'}</button>

        <div className="cat-paws" style={{ marginTop: 40 }}>
          {CATS.map((c: any) => <Paw key={c.id} size={12} color={c.color} />)}
        </div>
        <div style={{
          marginTop: 14, textAlign: 'center', fontFamily: "'DM Mono',monospace",
          fontSize: 10, color: C.muted, letterSpacing: '0.06em', lineHeight: 2,
        }}>
          guest access · cat information only
        </div>
      </div>
    </div>
  );
}
