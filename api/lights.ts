/* ═══════════════════════════════════════════════════════════════
   haus — smart home proxy
   ───────────────────────────────────────────────────────────────
   The ONLY component that holds the Tuya credentials. Runs on
   Vercel, never in the browser.

   GET  /api/lights             → [{ key, label, room, on, online, … }]
   POST /api/lights { key, on } → { key, on }

   Three gates, in order:
     1. valid Supabase JWT, or 401
     2. requested key is in DEVICES below, or 400
     3. only the whitelisted codes + a boolean are sent to Tuya
   The client never names a device id or a Tuya command. It sends a
   key from our own list and true/false. That's the whole surface.

   MULTI-GANG (power strips, multi-rocker wall switches)
   ───────────────────────────────────────────────────────────────
   Tuya has no "all gangs" command. A 3-gang device is three
   independent booleans: switch_1, switch_2, switch_3. So a "master"
   is something we compose: one entry listing every code, sent as one
   commands array in a single request, so the relays fire together.

   An entry with several `codes` is a group. An entry naming a
   `parent` is one gang of that group. Both point at the same Tuya
   device id.
   ═══════════════════════════════════════════════════════════════ */

import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/* ─── EDIT THIS LIST ─────────────────────────────────────────────
   key    — what the browser sends. Yours to choose, must be unique.
   id     — Tuya Device ID from step A4.
   codes  — every switch code this row controls. One for a normal
            plug; all of them for a multi-gang master.
   parent — set on a child row to nest it under a master's key.
   label  — shown in the app.

   Finding the codes: iot.tuya.com → Cloud → API Explorer → Device
   Status, paste the device id. A multi-gang returns switch_1 …
   switch_n. Then send one code at a time with Send Commands to see
   which physical socket clicks, and label them accordingly.        */
const DEVICES = [
  { key: 'dinnertable', id: '20307016f4cfa2126baf',  codes: ['switch_1'], label: 'Dinner Table Lamp', room: 'living room' },
  { key: 'pumpkin',     id: '70450166c82b96ca6a2b',  codes: ['switch_1'], label: 'Pumpkin Lamp',      room: 'work room' },
  { key: 'left',        id: '1554002648551950e48c',  codes: ['switch_1'], label: 'Left Lamp/Charger', room: 'living room' },
  { key: 'right',       id: '20307016c82b96caa4f5',  codes: ['switch_1'], label: 'Right Lamp',        room: 'living room' },
  { key: 'balcony',     id: 'bf21a01367f36eb7d3xk2w', codes: ['switch_1'], label: 'Balcony Lights',   room: 'work room' },

  /* ─── THE MULTI-GANG STRIP ─────────────────────────────────────
     Your codes are switch_1, switch_2, switch_3, switch_7 — note the
     jump. Tuya numbers DPs by its own internal scheme, not by socket
     position, so gaps like this are normal. Writing switch_4 here
     would give you a toggle that does nothing; the GET response
     flags any code the device doesn't report as `missing`.

     Fill in the device id (same on all five rows) and rename the
     children once you know which socket is which.                  */
  { key: 'work/game',   id: '306786719c9c1fb78ff0', codes: ['switch_1', 'switch_2', 'switch_3'],
    label: 'Work/Game Desk', room: 'work room' },
  { key: 'strip.1', id: '306786719c9c1fb78ff0', codes: ['switch_1'], label: 'Socket 1', room: 'work room', parent: 'work/game' },
  { key: 'strip.2', id: '306786719c9c1fb78ff0', codes: ['switch_2'], label: 'Socket 2', room: 'work room', parent: 'work/game' },
  { key: 'strip.3', id: '306786719c9c1fb78ff0', codes: ['switch_3'], label: 'Socket 3', room: 'work room', parent: 'work/game' },

  { key: 'bedroom',   id: '306786719c9c1fb78c90', codes: ['switch_1', 'switch_2', 'switch_3'],
    label: 'Bedroom Desk', room: 'bedroom' },
  { key: 'strip.4', id: '306786719c9c1fb78c90', codes: ['switch_1'], label: 'Socket 1', room: 'bedroom', parent: 'bedroom' },
  { key: 'strip.5', id: '306786719c9c1fb78c90', codes: ['switch_2'], label: 'Socket 2', room: 'bedroom', parent: 'bedroom' },
  { key: 'strip.6', id: '306786719c9c1fb78c90', codes: ['switch_3'], label: 'Socket 3', room: 'bedroom', parent: 'bedroom' },
];

const TUYA_BASE = 'https://openapi.tuyaeu.com'; // Central Europe
const ACCESS_ID = process.env.TUYA_ACCESS_ID || '';
const ACCESS_SECRET = process.env.TUYA_ACCESS_SECRET || '';

/* Public by design — same pair already sits in the client bundle. */
const SUPABASE_URL = 'https://vspgkbrbwzkjqsclddxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcGdrYnJid3pranFzY2xkZHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjAyODQsImV4cCI6MjA5MzgzNjI4NH0.z5mBjpsRDBTmA2S8H5gYEPvGQqfGEnF54RSxCcwA2hY';

const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Accepts the old single-`code` shape too, so an entry copied from
   the older guide still works without being rewritten. */
const codesOf = (d: any): string[] =>
  Array.isArray(d.codes) && d.codes.length ? d.codes : d.code ? [d.code] : [];

/* ─── Tuya request signing ───────────────────────────────────────
   sign = HMAC-SHA256( client_id + [access_token] + t + stringToSign )
   stringToSign = METHOD \n sha256(body) \n (empty header line) \n path   */

const sha256 = (s: string) =>
  crypto.createHash('sha256').update(s, 'utf8').digest('hex');

const hmac = (s: string) =>
  crypto.createHmac('sha256', ACCESS_SECRET).update(s, 'utf8').digest('hex').toUpperCase();

class TuyaError extends Error {
  code: any;
  constructor(code: any, msg: string) { super(msg); this.code = code; }
}

/* Warm instances reuse this; cold ones fetch a fresh token. */
let tokenCache: { token: string; exp: number } | null = null;

async function tuya(method: 'GET' | 'POST', path: string, body?: any): Promise<any> {
  const isTokenCall = path.startsWith('/v1.0/token');
  const token = isTokenCall ? '' : await getToken();
  const ts = Date.now().toString();
  const bodyStr = body ? JSON.stringify(body) : '';
  const stringToSign = [method, sha256(bodyStr), '', path].join('\n');

  const headers: Record<string, string> = {
    client_id: ACCESS_ID,
    sign: hmac(ACCESS_ID + token + ts + stringToSign),
    t: ts,
    sign_method: 'HMAC-SHA256',
    'Content-Type': 'application/json',
  };
  if (token) headers.access_token = token;

  const r = await fetch(TUYA_BASE + path, {
    method,
    headers,
    body: bodyStr || undefined,
  });
  const json: any = await r.json();
  if (!json.success) throw new TuyaError(json.code, json.msg || 'tuya error');
  return json.result;
}

async function getToken(): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now() + 60_000) return tokenCache.token;
  const r = await tuya('GET', '/v1.0/token?grant_type=1');
  tokenCache = { token: r.access_token, exp: Date.now() + r.expire_time * 1000 };
  return tokenCache.token;
}

/* ─── Handler ────────────────────────────────────────────────── */

export default async function handler(req: any, res: any) {
  try {
    if (!ACCESS_ID || !ACCESS_SECRET) {
      return res.status(500).json({ error: 'not_configured' });
    }

    /* Gate 1 — authentication. Any valid haus session (owner or the
       shared guest account) may switch lights. If you ever add a role
       that must NOT, look up profiles.role here and reject it. */
    const jwt = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!jwt) return res.status(401).json({ error: 'no_token' });
    const { data, error } = await supa.auth.getUser(jwt);
    if (error || !data?.user) return res.status(401).json({ error: 'bad_token' });

    if (req.method === 'GET') {
      /* One status call per PHYSICAL device, not per row. A master
         plus three children is one Tuya call, not four — which
         matters, because every call comes off the monthly quota. */
      const uniqueIds = Array.from(new Set(DEVICES.map((d) => d.id)));
      const statusById: Record<string, any[]> = {};
      const errById: Record<string, any> = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            statusById[id] = (await tuya('GET', `/v1.0/devices/${id}/status`)) || [];
          } catch (e: any) {
            if (isSubscriptionError(e)) throw e;   // whole tab is down, say so
            errById[id] = e;
          }
        })
      );

      const devices = DEVICES.map((d) => {
        const codes = codesOf(d);
        const base = {
          key: d.key,
          label: d.label,
          room: d.room,
          parent: (d as any).parent || null,
          isGroup: codes.length > 1,
          total: codes.length,
        };

        const status = statusById[d.id];
        if (!status) {
          const e = errById[d.id];
          return {
            ...base, on: false, someOn: false, onCount: 0, online: false,
            err: `${e?.code}: ${e?.message}`,
          };
        }

        const values = codes.map((c) => !!status.find((s: any) => s.code === c)?.value);
        const onCount = values.filter(Boolean).length;

        /* Codes the device doesn't actually report — almost always a
           typo in DEVICES. Surfaced so it's obvious rather than
           silently reading as "off". */
        const missing = codes.filter((c) => !status.some((s: any) => s.code === c));

        return {
          ...base,
          onCount,
          on: values.length > 0 && onCount === values.length,
          someOn: onCount > 0,
          online: true,
          ...(missing.length ? { missing } : {}),
        };
      });

      return res.status(200).json({ devices });
    }

    if (req.method === 'POST') {
      const raw = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

      /* Gate 2 — the key must be one of ours. No device ids from the client. */
      const device = DEVICES.find((d) => d.key === raw.key);
      if (!device) return res.status(400).json({ error: 'unknown_device' });

      /* Gate 3 — boolean only. No arbitrary Tuya commands. */
      if (typeof raw.on !== 'boolean') return res.status(400).json({ error: 'bad_value' });

      const codes = codesOf(device);
      if (!codes.length) return res.status(500).json({ error: 'device_has_no_codes' });

      /* Every gang in ONE request, so they fire together rather than
         stuttering down the strip. */
      await tuya('POST', `/v1.0/devices/${device.id}/commands`, {
        commands: codes.map((c) => ({ code: c, value: raw.on })),
      });
      return res.status(200).json({ key: device.key, on: raw.on });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (e: any) {
    if (isSubscriptionError(e)) {
      // Part G. Surfaced distinctly so the app can show a useful message.
      return res.status(503).json({ error: 'tuya_subscription' });
    }
    console.error('lights error', e?.code, e?.message);
    return res.status(502).json({ error: 'upstream', code: e?.code, msg: e?.message });
  }
}

function isSubscriptionError(e: any) {
  // 28841002 = "your subscription to cloud development plan has expired".
  // Don't match on words — Tuya says "permission" for lots of things.
  return String(e?.code) === '28841002';
}
