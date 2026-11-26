import {useEffect, useRef, useState} from 'react';
import {api} from './api';
import type {Watched} from '../content';

type Hit = {title: string; year: string; kind: 'movie' | 'series'; poster: string; overview: string; link: string; rating?: string; watchedOn?: string};
type Found = {source: string; results: Hit[]};

const same = (a: Watched, b: Hit) => a.title.toLowerCase() === b.title.toLowerCase() && String(a.year || '') === String(b.year || '') && a.kind === b.kind;

/** Search movies and series, or import a Letterboxd diary, then add what you pick to the Watched list. */
export default function MediaSearch({items, onAdd}: {items: Watched[]; onAdd: (adds: Watched[]) => Promise<void>}) {
  const [tab, setTab] = useState<'search' | 'letterboxd'>('search');
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const [q, setQ] = useState('');
  const [user, setUser] = useState(() => localStorage.getItem('pf-letterboxd') || '');
  const [found, setFound] = useState<Found | null>(null);
  const [busy, setBusy] = useState(false); // adding to the list
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState('');
  const reqId = useRef(0);

  // Search as you type: wait for a short pause, ask the server, and ignore answers that arrive late.
  useEffect(() => {
    if (tab !== 'search') return;
    const term = q.trim();
    const id = ++reqId.current;
    if (term.length < 2) { setFound(null); setErr(''); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await api<Found>(`/api/search?type=${type}&q=${encodeURIComponent(term)}`);
        if (id === reqId.current) { setFound(r); setErr(''); }
      } catch (e) {
        if (id === reqId.current) { setErr((e as Error).message); setFound(null); }
      } finally {
        if (id === reqId.current) setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q, type, tab]);

  const loadDiary = async () => {
    setSearching(true); setErr(''); setFound(null);
    try { localStorage.setItem('pf-letterboxd', user); setFound(await api<Found>(`/api/letterboxd?user=${encodeURIComponent(user.trim())}`)); }
    catch (e) { setErr((e as Error).message); } finally { setSearching(false); }
  };

  const toItem = (h: Hit): Watched => ({
    title: h.title, year: h.year || undefined, kind: h.kind, poster: h.poster || undefined, link: h.link || undefined,
    rating: h.rating ? Number(h.rating) : undefined, watchedOn: h.watchedOn || undefined,
  });
  const fresh = (h: Hit) => !items.some((w) => same(w, h));
  const addOne = async (h: Hit) => { setBusy(true); try { await onAdd([toItem(h)]); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };
  const addAll = async () => {
    const adds = (found?.results || []).filter(fresh).map(toItem);
    if (!adds.length) return;
    setBusy(true);
    try { await onAdd(adds); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <section className="adm-panel" aria-label="Find movies and series">
      <div className="adm-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'search'} className={tab === 'search' ? 'on' : ''} onClick={() => { setTab('search'); setFound(null); setErr(''); }}>Search movies &amp; series</button>
        <button role="tab" aria-selected={tab === 'letterboxd'} className={tab === 'letterboxd' ? 'on' : ''} onClick={() => { setTab('letterboxd'); setFound(null); setErr(''); }}>Import from Letterboxd</button>
      </div>

      <form className="adm-searchbar" onSubmit={(e) => { e.preventDefault(); if (tab === 'letterboxd') void loadDiary(); }}>
        {tab === 'search' ? (
          <>
            <select className="adm-input" value={type} onChange={(e) => setType(e.target.value as 'movie' | 'series')} aria-label="Type">
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>
            <input className="adm-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Start typing a title, e.g. Inception" aria-label="Title" autoFocus />
          </>
        ) : (
          <input className="adm-input" value={user} onChange={(e) => setUser(e.target.value)} placeholder="Your Letterboxd username" aria-label="Letterboxd username" />
        )}
        {tab === 'letterboxd' && (
          <button className="adm-btn" type="submit" disabled={searching || !user.trim()}>{searching ? 'Loading…' : 'Load diary'}</button>
        )}
      </form>
      {tab === 'search' && (
        <p className="adm-help" aria-live="polite">
          {searching ? 'Searching…' : q.trim().length > 0 && q.trim().length < 2 ? 'Keep typing…' : 'Results appear as you type.'}
        </p>
      )}
      {tab === 'letterboxd' && <p className="adm-help">Reads your public diary feed (your latest 50 films, with ratings and posters). Letterboxd has no series, so use Search for those.</p>}
      {err && <p role="alert" className="adm-error">{err}</p>}

      {found && (
        <>
          <div className="adm-found-head">
            <span>{found.results.length} result{found.results.length === 1 ? '' : 's'} · via {found.source}</span>
            {tab === 'letterboxd' && found.results.some(fresh) && <button className="adm-btn adm-secondary" onClick={addAll} disabled={busy}>Add all new ({found.results.filter(fresh).length})</button>}
          </div>
          {found.results.length === 0 && <p className="adm-help">Nothing found. Try another spelling.</p>}
          <ul className="adm-results">
            {found.results.map((h, i) => (
              <li key={`${h.title}-${h.year}-${i}`} className="adm-hit">
                {h.poster ? <img src={h.poster} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <div className="adm-noposter" aria-hidden="true">{h.title.slice(0, 1)}</div>}
                <div className="adm-hit-body">
                  <strong>{h.title}</strong> <span className="adm-muted">{h.year}{h.rating ? ` · ★ ${h.rating}` : ''}</span>
                  {h.overview && <p className="adm-muted">{h.overview}</p>}
                </div>
                {fresh(h)
                  ? <button className="adm-btn adm-secondary" onClick={() => void addOne(h)} disabled={busy}>Add</button>
                  : <span className="adm-muted">Added ✓</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
