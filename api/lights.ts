/* ═══════════════════════════════════════════════════════════════
   haus — smart home proxy
   ───────────────────────────────────────────────────────────────
   The ONLY component that holds the Tuya credentials. Runs on
   Vercel, never in the browser.

   GET  /api/lights            → [{ key, label, room, on, online }]
   POST /api/lights { key, on } → { key, on }

   Three gates, in order:
     1. valid Supabase JWT, or 401
     2. requested key is in DEVICES below, or 400
     3. only the whitelisted code + a boolean is sent to Tuya
   The client never names a device id or a Tuya command. It sends a
   key from our own list and true/false. That's the whole surface.
   ═══════════════════════════════════════════════════════════════ */

   import crypto from 'node:crypto';
   import { createClient } from '@supabase/supabase-js';
   
   /* ─── EDIT THIS LIST ─────────────────────────────────────────────
      key    — what the browser sends. Yours to choose.
      id     — Tuya Device ID from step A4.
      code   — the switch code from step A4 (usually switch_1).
      label  — shown in the app.
      Adding a device here is the whole job of adding a device.        */
   const DEVICES = [
     { key: 'dinnertable', id: '20307016f4cfa2126baf', code: 'switch_1', label: 'Dinner Table Lamp', room: 'living room' },
     { key: 'pumpkin',       id: '70450166c82b96ca6a2b', code: 'switch_2', label: 'Pumpkin Lamp',     room: 'work room' },
     { key: 'work/game',       id: '306786719c9c1fb78ff0', code: 'switch_3', label: 'Work/Game Desk',     room: 'work room' },
     { key: 'bedroom',       id: '306786719c9c1fb78c90', code: 'switch_4', label: 'Bedroom Desk',     room: 'bedroom' },
     { key: 'left',       id: '1554002648551950e48c', code: 'switch_5', label: 'Left Lamp/Charger',     room: 'living room' },
     { key: 'right',       id: '20307016c82b96caa4f5', code: 'switch_6', label: 'Right Lamp',     room: 'living room' },
     { key: 'balcony',       id: 'bf21a01367f36eb7d3xk2w', code: 'switch_7', label: 'Balcony Lights',     room: 'work room' },
   ];
   
   const TUYA_BASE = 'https://openapi.tuyaeu.com'; // Central Europe
   const ACCESS_ID = process.env.TUYA_ACCESS_ID || '';
   const ACCESS_SECRET = process.env.TUYA_ACCESS_SECRET || '';
   
   /* Public by design — same pair already sits in the client bundle. */
   const SUPABASE_URL = 'https://vspgkbrbwzkjqsclddxs.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcGdrYnJid3pranFzY2xkZHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjAyODQsImV4cCI6MjA5MzgzNjI4NH0.z5mBjpsRDBTmA2S8H5gYEPvGQqfGEnF54RSxCcwA2hY';
   
   const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   
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
         const devices = await Promise.all(
           DEVICES.map(async (d) => {
             try {
               const status = await tuya('GET', `/v1.0/devices/${d.id}/status`);
               const hit = (status || []).find((s: any) => s.code === d.code);
               return { key: d.key, label: d.label, room: d.room, on: !!hit?.value, online: true };
             } catch (e: any) {
               if (isSubscriptionError(e)) throw e;       // whole tab is down, say so
               return { key: d.key, label: d.label, room: d.room, on: false, online: false, err: `${e?.code}: ${e?.message}` };
             }
           })
         );
         return res.status(200).json({ devices });
       }
   
       if (req.method === 'POST') {
         const raw = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
   
         /* Gate 2 — the key must be one of ours. No device ids from the client. */
         const device = DEVICES.find((d) => d.key === raw.key);
         if (!device) return res.status(400).json({ error: 'unknown_device' });
   
         /* Gate 3 — boolean only. No arbitrary Tuya commands. */
         if (typeof raw.on !== 'boolean') return res.status(400).json({ error: 'bad_value' });
   
         await tuya('POST', `/v1.0/devices/${device.id}/commands`, {
           commands: [{ code: device.code, value: raw.on }],
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