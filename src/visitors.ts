/*
 * Unique visitors. The browser keeps one random id (no personal data) and tells the server once per session; the server
 * counts each id once. Returns the total, or null when there is no backend (static hosting) or the owner is in /admin.
 */
const KEY = 'portfolio:visitor-id';
let pending: Promise<number | null> | null = null;

function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(KEY, id); }
    return id;
  } catch { return null; } // storage blocked: don't count rather than count the same person twice
}

async function call(path: string, init?: RequestInit): Promise<number | null> {
  try {
    const r = await fetch(path, {signal: AbortSignal.timeout(4000), ...init});
    if (!r.ok) return null;
    const {count} = (await r.json()) as {count?: number};
    return typeof count === 'number' ? count : null;
  } catch { return null; }
}

export function visitorCount(): Promise<number | null> {
  pending ||= (() => {
    const id = location.pathname.startsWith('/admin') ? null : visitorId();
    return id
      ? call('/api/visit', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id})})
      : call('/api/visitors');
  })();
  return pending;
}
