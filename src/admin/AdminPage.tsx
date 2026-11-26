import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {COLLECTIONS, COLLECTION_NAMES, type CollectionDef} from '../schema';
import {applyCollection, getCollection, resetCollection, useContentVersion} from '../remote';
import type {Watched} from '../content';
import {ApiError, api, getToken, setToken} from './api';
import {FieldsForm} from './Form';
import MediaSearch from './MediaSearch';
import './admin.css';

type Obj = Record<string, unknown>;
type Info = {storage: string; tmdb: boolean};

const blankItem = (def: CollectionDef): Obj =>
  Object.fromEntries(def.fields.map((f) => [f.key, f.type === 'strings' || f.type === 'list' ? [] : '']));

export default function AdminPage() {
  const [state, setState] = useState<'checking' | 'out' | 'in'>(getToken() ? 'checking' : 'out');
  const [info, setInfo] = useState<Info>(() => JSON.parse(sessionStorage.getItem('pf-admin-info') || '{"storage":"","tmdb":false}'));

  useEffect(() => {
    document.title = 'Admin · Tarek Alam Bhuiyan';
    if (!getToken()) return;
    api('/api/session').then(() => setState('in')).catch(() => { setToken(''); setState('out'); });
  }, []);

  const signOut = () => { setToken(''); setState('out'); };

  if (state === 'checking') return <p className="adm-muted">Checking your session…</p>;
  if (state === 'out') {
    return <Login onDone={(i) => { setInfo(i); sessionStorage.setItem('pf-admin-info', JSON.stringify(i)); setState('in'); }} />;
  }
  return <Dashboard info={info} onSignOut={signOut} />;
}

/* ---------------- sign in ---------------- */

function Login({onDone}: {onDone: (info: Info) => void}) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const r = await api<{token: string; storage: string; tmdb: boolean}>('/api/login', {method: 'POST', body: {password: pw}, auth: false});
      setToken(r.token);
      onDone({storage: r.storage, tmdb: r.tmdb});
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); setPw(''); }
  };
  return (
    <form className="adm-login" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <h1>Admin</h1>
      <p className="adm-muted">Sign in to edit the site.</p>
      <label className="adm-label" htmlFor="adm-pw">Password</label>
      <input id="adm-pw" className="adm-input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
      {err && <p role="alert" className="adm-error">{err}</p>}
      <button className="adm-btn" type="submit" disabled={busy || !pw}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

/* ---------------- dashboard ---------------- */

function Dashboard({info, onSignOut}: {info: Info; onSignOut: () => void}) {
  const navigate = useNavigate();
  useContentVersion();
  const [name, setName] = useState('watched');
  const def = COLLECTIONS[name];
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState<Obj>({});
  const [msg, setMsg] = useState<{kind: 'ok' | 'err'; text: string} | null>(null);
  const [busy, setBusy] = useState(false);

  const current = getCollection(name) as Obj[] | Obj;
  const list = (def.kind === 'list' ? current : []) as Obj[];

  const pick = (n: string) => { setName(n); setEditing(null); setMsg(null); if (COLLECTIONS[n].kind === 'object') setDraft(getCollection(n) as Obj); };
  useEffect(() => { if (def.kind === 'object') setDraft(getCollection(name) as Obj); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  /** Sends the whole collection to the server, then shows it on the site straight away. */
  const save = async (value: unknown, okText = 'Saved. The site is updated.') => {
    setBusy(true); setMsg(null);
    try {
      const r = await api<{value: unknown}>(`/api/content/${name}`, {method: 'PUT', body: {value}});
      applyCollection(name, r.value);
      setMsg({kind: 'ok', text: okText});
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) { onSignOut(); return false; }
      setMsg({kind: 'err', text: (e as Error).message});
      return false;
    } finally { setBusy(false); }
  };

  const titleOf = (it: Obj) => String(it[def.titleKey || def.fields[0].key] ?? '(untitled)');
  const subOf = (it: Obj) => (def.subtitleKey ? String(it[def.subtitleKey] ?? '') : '');

  const saveDraft = async () => {
    const next = editing === 'new' ? [...list, draft] : list.map((x, i) => (i === editing ? draft : x));
    if (await save(next)) setEditing(null);
  };
  const remove = async (i: number) => {
    if (!window.confirm(`Delete "${titleOf(list[i])}"? This cannot be undone.`)) return;
    await save(list.filter((_, k) => k !== i), 'Deleted.');
  };
  const move = async (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    await save(next, 'Order saved.');
  };
  const reset = async () => {
    if (!window.confirm(`Reset "${def.label}" to the built-in default? Your edits to it will be removed.`)) return;
    setBusy(true); setMsg(null);
    try {
      await api(`/api/content/${name}`, {method: 'DELETE'});
      resetCollection(name);
      if (def.kind === 'object') setDraft(getCollection(name) as Obj);
      setEditing(null);
      setMsg({kind: 'ok', text: 'Reset to the default.'});
    } catch (e) { setMsg({kind: 'err', text: (e as Error).message}); } finally { setBusy(false); }
  };
  const addMedia = async (adds: Watched[]) => { await save([...list, ...adds], `Added ${adds.length} to your watched list.`); };

  return (
    <div className="adm">
      <header className="adm-top">
        <div>
          <h1>Admin</h1>
          <p className="adm-muted">Saving to {info.storage === 'upstash' ? 'the cloud database' : 'a local file'} · movie and series search via {info.tmdb ? 'TMDB' : 'TVmaze and Wikipedia'}</p>
        </div>
        <div className="adm-row-actions">
          <button className="adm-btn adm-secondary" onClick={() => navigate('/')}>View site</button>
          <button className="adm-btn adm-secondary" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      <div className="adm-layout">
        <nav className="adm-nav" aria-label="Content">
          {COLLECTION_NAMES.map((n) => (
            <button key={n} className={n === name ? 'on' : ''} onClick={() => pick(n)}>{COLLECTIONS[n].label}</button>
          ))}
        </nav>

        <main className="adm-main">
          <div className="adm-main-head">
            <h2>{def.label}</h2>
            <button className="adm-btn adm-secondary" onClick={() => void reset()} disabled={busy}>Reset to default</button>
          </div>
          {msg && <p role={msg.kind === 'err' ? 'alert' : 'status'} className={msg.kind === 'err' ? 'adm-error' : 'adm-ok'}>{msg.text}</p>}

          {def.kind === 'object' ? (
            <>
              <FieldsForm fields={def.fields} value={draft} onChange={setDraft} />
              <div className="adm-actions"><button className="adm-btn" onClick={() => void save(draft)} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
            </>
          ) : editing !== null ? (
            <>
              <button className="adm-link" onClick={() => setEditing(null)}>← Back to the list</button>
              <h3>{editing === 'new' ? `New: ${def.label}` : `Edit: ${titleOf(list[editing])}`}</h3>
              <FieldsForm fields={def.fields} value={draft} onChange={setDraft} />
              <div className="adm-actions">
                <button className="adm-btn" onClick={() => void saveDraft()} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
                <button className="adm-btn adm-secondary" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {name === 'watched' && <MediaSearch items={list as unknown as Watched[]} onAdd={addMedia} />}
              <div className="adm-actions">
                <button className="adm-btn" onClick={() => { setDraft(blankItem(def)); setEditing('new'); }}>+ Add {def.label.toLowerCase()} manually</button>
              </div>
              {list.length === 0 && <p className="adm-muted">Nothing here yet.</p>}
              <ul className="adm-list">
                {list.map((it, i) => (
                  <li key={i} className="adm-item">
                    {name === 'watched' && (it.poster ? <img className="adm-thumb" src={String(it.poster)} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <div className="adm-thumb adm-noposter" aria-hidden="true">{titleOf(it).slice(0, 1)}</div>)}
                    <div className="adm-item-body">
                      <strong>{titleOf(it)}</strong>
                      {subOf(it) && <span className="adm-muted"> · {subOf(it)}</span>}
                    </div>
                    <div className="adm-row-actions">
                      <button className="adm-mini" aria-label="Move up" onClick={() => void move(i, -1)} disabled={busy || i === 0}>↑</button>
                      <button className="adm-mini" aria-label="Move down" onClick={() => void move(i, 1)} disabled={busy || i === list.length - 1}>↓</button>
                      <button className="adm-btn adm-secondary" onClick={() => { setDraft(JSON.parse(JSON.stringify(it))); setEditing(i); }}>Edit</button>
                      <button className="adm-btn adm-danger" onClick={() => void remove(i)} disabled={busy}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
