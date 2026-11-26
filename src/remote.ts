import {useSyncExternalStore} from 'react';
import * as C from './content';
import {COLLECTIONS} from './schema';

/*
 * Content starts as the built-in defaults in content.ts. Edits made in /admin are stored on the server and loaded
 * on top of them: each collection is replaced IN PLACE (so every component keeps reading the same exports), then
 * subscribers are told to re-render.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const targets: Record<string, any> = {
  profile: C.profile, about: C.about, experience: C.experience, education: C.education, projects: C.projects,
  skills: C.skills, achievements: C.achievements, travel: C.travel, watched: C.watched, playlists: C.playlists, games: C.games, learning: C.learning,
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const defaults: Record<string, unknown> = Object.fromEntries(Object.entries(targets).map(([k, v]) => [k, clone(v)]));

let version = 0;
const listeners = new Set<() => void>();
const bump = () => { version++; listeners.forEach((l) => l()); };
export const useContentVersion = () => useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => version);

/** A deep copy of a collection as the site currently shows it. */
export const getCollection = (name: string) => clone(targets[name]);

export function applyCollection(name: string, value: unknown, notify = true) {
  const t = targets[name];
  if (!t) return;
  if (Array.isArray(t)) t.splice(0, t.length, ...(value as unknown[]));
  else {
    const v = value as Record<string, unknown>;
    for (const f of COLLECTIONS[name].fields) t[f.key] = v[f.key] ?? (f.type === 'strings' || f.type === 'list' ? [] : '');
  }
  if (notify) bump();
}

export const resetCollection = (name: string) => applyCollection(name, clone(defaults[name]));

export async function loadRemoteContent(timeoutMs = 800) {
  try {
    const r = await fetch('/api/content', {signal: AbortSignal.timeout(timeoutMs)});
    if (!r.ok) return;
    const {collections} = (await r.json()) as {collections?: Record<string, unknown>};
    for (const [name, value] of Object.entries(collections || {})) applyCollection(name, value, false);
    bump();
  } catch { /* offline or no backend (static hosting): the built-in content is used */ }
}
