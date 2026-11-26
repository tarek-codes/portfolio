import {memo, useEffect, useMemo, useRef, useState} from 'react';
import gsap from 'gsap';
import type {ReactNode} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Grid} from '@astryxdesign/core/Grid';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {Card} from '@astryxdesign/core/Card';
import {Link} from '@astryxdesign/core/Link';
import {Button} from '@astryxdesign/core/Button';
import {Token} from '@astryxdesign/core/Token';
import {travel, playlists, watched, games, learning, type Place} from '../content';
import {BD_H, BD_W, DISTRICTS, projectBD} from '../bd-map';
import {Section} from '../ui';
import {MusicalNoteIcon, FilmIcon, TvIcon, PuzzlePieceIcon, LightBulbIcon} from '@heroicons/react/24/outline';

function InterestShell({title, intro, children}: {title: string; intro: string; children: ReactNode}) {
  return (
    <>
      <VStack gap={4} paddingBlock={4}>
        <div data-hero>
          <RouterLink to="/" state={{scroll: 'about'}} style={{color: 'inherit'}}>
            <Text color="secondary">← About Me</Text>
          </RouterLink>
        </div>
        <div data-hero><Heading level={1} type="display-1" textWrap="balance">{title}</Heading></div>
        <div data-hero><Text type="large" color="secondary" textWrap="balance">{intro}</Text></div>
      </VStack>
      {children}
    </>
  );
}

/* ---------------- Travelling ---------------- */

const ink = (pct: number) => `color-mix(in srgb, var(--fg) ${pct}%, transparent)`;
const VISITED = 'light-dark(#10b981, #34d399)'; // map fill
const VISITED_TEXT = 'light-dark(#047857, #34d399)'; // the same green, deep enough to read as text on the sand page
type View = {x: number; y: number; w: number};
const FULL: View = {x: 0, y: 0, w: BD_W};

/** The view that frames a place and its spots, in the map's own aspect ratio. */
function frame(p: Place): View {
  const pts = [projectBD(p.lon, p.lat), ...p.spots.map((s) => projectBD(s.lon, s.lat))];
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const w = Math.max((Math.max(...xs) - Math.min(...xs)) * 1.7, (Math.max(...ys) - Math.min(...ys)) * 1.7 * (BD_W / BD_H), 34);
  const h = w * (BD_H / BD_W);
  return {x: cx - w / 2, y: cy - h / 2, w};
}

/** The 64 district shapes. Memoised: they only change when the visited set or the highlighted district does. */
const DistrictLayer = memo(function DistrictLayer({visited, activeKey, onPick, onHover}: {
  visited: Set<string>; activeKey: string; onPick: (name: string) => void; onHover: (name: string | null) => void;
}) {
  const active = activeKey ? new Set(activeKey.split('|')) : null;
  return (
    <g>
      {DISTRICTS.map((d) => {
        const seen = visited.has(d.name);
        return (
          <path
            key={d.name}
            d={d.path}
            fillRule="evenodd"
            style={{
              fill: seen ? VISITED : ink(9), stroke: 'var(--bg)', strokeWidth: 1, strokeLinejoin: 'round',
              cursor: seen ? 'pointer' : 'default', transition: 'fill 0.3s ease',
              opacity: active && !active.has(d.name) && seen ? 0.5 : 1,
            }}
            vectorEffect="non-scaling-stroke"
            onMouseEnter={() => onHover(d.name)}
            onMouseLeave={() => onHover(null)}
            onClick={() => seen && onPick(d.name)}
          />
        );
      })}
    </g>
  );
});

export function TravelPage() {
  const [focus, setFocus] = useState<string | null>(null); // the place the map is zoomed on
  const [spot, setSpot] = useState<string | null>(null); // a spot being pointed at
  const [hover, setHover] = useState<string | null>(null); // a district being pointed at
  const [view, setView] = useState<View>(FULL);
  const cur = useRef<View>({...FULL});
  const tween = useRef<gsap.core.Tween | null>(null);

  // every district that has a place or a spot in it
  const visited = useMemo(() => {
    const set = new Set<string>();
    travel.forEach((p) => { if (p.district) set.add(p.district); p.spots.forEach((s) => s.district && set.add(s.district)); });
    return set;
  }, [travel.length, travel.map((p) => p.district + p.spots.map((s) => s.district).join()).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomTo = (id: string | null) => {
    setFocus(id);
    setSpot(null);
    const place = travel.find((p) => p.id === id);
    const to = place ? frame(place) : FULL;
    tween.current?.kill();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cur.current = {...to};
      setView({...to});
      return;
    }
    tween.current = gsap.to(cur.current, {
      x: to.x, y: to.y, w: to.w, duration: 0.9, ease: 'power3.inOut',
      onUpdate: () => setView({...cur.current}),
    });
  };
  useEffect(() => () => { tween.current?.kill(); }, []);

  const pickDistrict = (name: string) => {
    const p = travel.find((x) => x.district === name) ?? travel.find((x) => x.spots.some((s) => s.district === name));
    if (p) zoomTo(p.id);
  };

  const k = view.w / BD_W; // keeps pins and text the same size on screen at any zoom
  const h = view.w * (BD_H / BD_W);
  const zoomed = focus !== null;
  const place = travel.find((p) => p.id === focus);
  const placeDistricts = new Set(place ? [place.district, ...place.spots.map((s) => s.district)] : []);
  const count = visited.size;

  return (
    <InterestShell
      title="Travelling"
      intro="I love getting out of Dhaka. This map colours in the districts of Bangladesh I have visited. Pick a place to zoom in on the spots.">
      <div data-reveal>
        <Grid columns={{minWidth: 300, max: 2}} gap={8} align="start">
          <div style={{maxWidth: 460, width: '100%', marginInline: 'auto', position: 'sticky', top: 24}}>
            {/* the running count, like Unseen Bangladesh */}
            <div style={{marginBottom: 12}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                <span style={{fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: VISITED_TEXT}}>{count}</span>
                <span style={{fontSize: 16, color: ink(60)}}>of {DISTRICTS.length} districts visited</span>
              </div>
              <div style={{height: 6, borderRadius: 999, background: ink(10), marginTop: 8, overflow: 'hidden'}} role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={DISTRICTS.length}>
                <div style={{height: '100%', width: `${(count / DISTRICTS.length) * 100}%`, background: VISITED, borderRadius: 999, transition: 'width 0.6s ease'}} />
              </div>
              <div style={{display: 'flex', gap: 16, marginTop: 10, fontSize: 13, color: ink(65)}}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><i style={{width: 12, height: 12, borderRadius: 4, background: VISITED, display: 'inline-block'}} />Visited ({count})</span>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><i style={{width: 12, height: 12, borderRadius: 4, background: ink(9), border: `1px solid ${ink(25)}`, display: 'inline-block'}} />Not yet ({DISTRICTS.length - count})</span>
              </div>
            </div>

            <div style={{position: 'relative'}}>
              {(place || hover) && (
                <div
                  style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 1, padding: '6px 12px', borderRadius: 999,
                    background: 'var(--fg)', color: 'var(--bg)', fontSize: 13, fontWeight: 600, pointerEvents: 'none',
                  }}>
                  {hover ? `${hover} · ${visited.has(hover) ? 'visited' : 'not yet'}` : `${place!.name} · ${place!.area}`}
                </div>
              )}
              <svg
                viewBox={`${view.x} ${view.y} ${view.w} ${h}`}
                role="img"
                aria-label={`Map of Bangladesh: ${count} of ${DISTRICTS.length} districts visited`}
                style={{width: '100%', height: 'auto', display: 'block', overflow: 'hidden'}}>
                <DistrictLayer visited={visited} activeKey={zoomed ? [...placeDistricts].sort().join('|') : ''} onPick={pickDistrict} onHover={setHover} />
                {/* district names, once zoomed in */}
                {zoomed && DISTRICTS.filter((d) => d.cx > view.x && d.cx < view.x + view.w && d.cy > view.y && d.cy < view.y + h).map((d) => (
                  <text key={d.name} x={d.cx} y={d.cy} textAnchor="middle" fontSize={10 * k} fontWeight={visited.has(d.name) ? 700 : 500}
                    fill="var(--fg)" opacity={visited.has(d.name) ? 0.85 : 0.35} style={{pointerEvents: 'none'}}>{d.name}</text>
                ))}
                {place && place.spots.map((s, i) => {
                  const [x, y] = projectBD(s.lon, s.lat);
                  const on = spot === s.name;
                  return (
                    <g
                      key={s.name}
                      role="button"
                      tabIndex={0}
                      aria-label={s.name}
                      style={{cursor: 'pointer', outline: 'none'}}
                      onMouseEnter={() => setSpot(s.name)}
                      onMouseLeave={() => setSpot(null)}
                      onFocus={() => setSpot(s.name)}
                      onBlur={() => setSpot(null)}>
                      <circle cx={x} cy={y} r={(on ? 15 : 11) * k} fill="var(--fg)" stroke="var(--bg)" strokeWidth={1.5 * k} />
                      <text x={x} y={y + 4.2 * k} textAnchor="middle" fontSize={12 * k} fontWeight={700} fill="var(--bg)">{i + 1}</text>
                      {on && (
                        <g>
                          <rect x={x + 16 * k} y={y - 11 * k} width={(s.name.length * 7 + 18) * k} height={22 * k} rx={6 * k} fill="var(--fg)" />
                          <text x={x + 25 * k} y={y + 4 * k} fontSize={12 * k} fontWeight={600} fill="var(--bg)">{s.name}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            {zoomed && (
              <div style={{textAlign: 'center', marginTop: 8}}>
                <Button label="Show the whole map" variant="secondary" onClick={() => zoomTo(null)} />
              </div>
            )}
          </div>

          <div>
            {/* one compact line per place, so the list stays short however many places are added */}
            <ul style={{listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column'}}>
              {travel.map((p, idx) => {
                const on = focus === p.id;
                return (
                  <li key={p.id} id={`place-${p.id}`} style={{borderTop: `1px solid ${ink(14)}`}}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => zoomTo(on ? null : p.id)}
                      style={{
                        display: 'flex', alignItems: 'baseline', gap: 12, width: '100%', padding: '11px 10px', border: 0, textAlign: 'left',
                        background: on ? ink(8) : 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer', borderRadius: 8,
                        transition: 'background 0.2s ease',
                      }}>
                      <span style={{fontSize: 12, fontWeight: 600, color: ink(68), fontVariantNumeric: 'tabular-nums'}}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={{fontSize: 17, fontWeight: on ? 700 : 500}}>{p.name}</span>
                      <span style={{marginLeft: 'auto', fontSize: 13, color: ink(72), whiteSpace: 'nowrap'}}>{p.spots.length} places</span>
                    </button>
                  </li>
                );
              })}
              <li style={{borderTop: `1px solid ${ink(14)}`}} aria-hidden="true" />
            </ul>

            {/* the chosen place's spots, in a small fixed-size panel */}
            <div aria-live="polite" style={{marginTop: 18, padding: 18, borderRadius: 14, border: `1px solid ${ink(16)}`, background: ink(4), minHeight: 150}}>
              {place ? (
                <VStack gap={3}>
                  <VStack gap={0.5}>
                    <Heading level={2} type="display-3">{place.name}</Heading>
                    <Text color="secondary" size="sm">{place.area}</Text>
                  </VStack>
                  <ol style={{margin: 0, padding: 0, listStyle: 'none', columnWidth: 190, columnGap: 20}}>
                    {place.spots.map((s2, i) => (
                      <li
                        key={s2.name}
                        onMouseEnter={() => setSpot(s2.name)}
                        onMouseLeave={() => setSpot(null)}
                        style={{display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', breakInside: 'avoid', fontSize: 15, opacity: !spot || spot === s2.name ? 1 : 0.45, transition: 'opacity 0.2s ease'}}>
                        <span aria-hidden="true" style={{flex: 'none', width: 20, height: 20, borderRadius: 999, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, background: 'var(--fg)', color: 'var(--bg)'}}>{i + 1}</span>
                        <span>{s2.name}</span>
                      </li>
                    ))}
                  </ol>
                </VStack>
              ) : (
                <VStack gap={3}>
                  <Text color="secondary">Districts I have visited. Pick a place above, or a coloured district on the map, to zoom in.</Text>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {[...visited].sort().map((n) => (
                      <button key={n} type="button" onClick={() => pickDistrict(n)} style={{
                        border: 0, cursor: 'pointer', padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, font: 'inherit',
                        background: `color-mix(in srgb, ${VISITED} 22%, transparent)`, color: 'inherit',
                      }}>{n}</button>
                    ))}
                  </div>
                </VStack>
              )}
            </div>
          </div>
        </Grid>
      </div>
    </InterestShell>
  );
}

/* ---------------- Music ---------------- */

export function MusicPage() {
  return (
    <InterestShell
      title="Music"
      intro="Music follows me everywhere: while coding, while travelling, while doing nothing at all. These are my playlists.">
      {playlists.length === 0 ? (
        <Section id="playlists" title="Playlists" icon={MusicalNoteIcon}>
          <Text color="secondary">My playlists are being curated. Check back soon.</Text>
        </Section>
      ) : (
        <Section id="playlists" title="Playlists" icon={MusicalNoteIcon}>
          <div data-stagger>
            <Grid columns={{minWidth: 320, max: 2}} gap={4}>
              {playlists.map((p) => (
                <div key={p.name} data-item>
                  <Card padding={4}>
                    <VStack gap={3}>
                      <VStack gap={0.5}>
                        <Heading level={3} weight="semibold">{p.name}</Heading>
                        <Text color="secondary" textWrap="pretty">{p.description}</Text>
                      </VStack>
                      {p.embed && (
                        <iframe
                          title={`${p.name} playlist`}
                          src={p.embed}
                          loading="lazy"
                          allow="encrypted-media"
                          style={{width: '100%', height: 152, border: 0, borderRadius: 12}}
                        />
                      )}
                      <Link href={p.href} isExternalLink color="primary" hasUnderline>Open playlist</Link>
                    </VStack>
                  </Card>
                </div>
              ))}
            </Grid>
          </div>
        </Section>
      )}
    </InterestShell>
  );
}

/* ---------------- Watching ---------------- */

export function WatchingPage() {
  const groups = [
    ['series', 'TV Series'],
    ['movie', 'Movies'],
  ] as const;
  return (
    <InterestShell
      title="Watching"
      intro="Good stories are my favourite way to switch off. Here is what I have watched.">
      {watched.length === 0 ? (
        <Section id="watched" title="Watched" icon={FilmIcon}>
          <Text color="secondary">My watch list is on its way. Check back soon.</Text>
        </Section>
      ) : (
        groups.map(([kind, label]) => {
          const items = watched.filter((w) => w.kind === kind);
          if (!items.length) return null;
          return (
            <Section key={kind} id={kind} title={label} icon={kind === 'series' ? TvIcon : FilmIcon}>
              <div data-stagger>
                <Grid columns={{minWidth: 140, max: 6}} gap={5}>
                  {items.map((w) => {
                    const tile = (
                      <VStack gap={1.5}>
                        {w.poster ? (
                          <img
                            src={w.poster}
                            alt={`${w.title} poster`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            style={{width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', borderRadius: 10, border: `1px solid ${ink(18)}`, display: 'block'}}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%', aspectRatio: '2 / 3', borderRadius: 10, border: `1px solid ${ink(18)}`, background: ink(6),
                              display: 'grid', placeItems: 'center', padding: 12, textAlign: 'center', fontWeight: 600,
                            }}>
                            {w.title}
                          </div>
                        )}
                        <VStack gap={0.5}>
                          <Text weight="semibold" size="sm">{w.title}</Text>
                          <Text color="secondary" size="sm">
                            {[w.year, w.rating ? '★'.repeat(Math.floor(w.rating)) + (w.rating % 1 ? '½' : '') : ''].filter(Boolean).join(' · ')}
                          </Text>
                          {w.note && <Text color="secondary" size="sm" textWrap="pretty">{w.note}</Text>}
                        </VStack>
                      </VStack>
                    );
                    return (
                      <div key={`${w.title}-${w.year}`} data-item>
                        {w.link ? <a href={w.link} target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none', display: 'block'}}>{tile}</a> : tile}
                      </div>
                    );
                  })}
                </Grid>
              </div>
            </Section>
          );
        })
      )}
    </InterestShell>
  );
}

/* ---------------- Video games ---------------- */

export function GamingPage() {
  return (
    <InterestShell
      title="Video Games"
      intro="Games are how I recharge, and how I lose track of time. Here is what I play.">
      <Section id="games" title="Games" icon={PuzzlePieceIcon}>
        {games.length === 0 ? (
          <Text color="secondary">My game list is on its way. Check back soon.</Text>
        ) : (
          <div data-stagger>
            <VStack gap={4}>
              {games.map((g) => (
                <div key={g.title} data-item>
                  <HStack gap={3} align="start">
                    {g.cover && <img src={g.cover} alt="" loading="lazy" style={{width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flex: 'none'}} />}
                  <VStack gap={0.5}>
                    <HStack gap={2} wrap="wrap">
                      <Text weight="semibold">{g.title}</Text>
                      {g.platform && <Text color="secondary">{g.platform}</Text>}
                    </HStack>
                    {g.note && <Text color="secondary" textWrap="pretty">{g.note}</Text>}
                  </VStack>
                  </HStack>
                </div>
              ))}
            </VStack>
          </div>
        )}
      </Section>
    </InterestShell>
  );
}

/* ---------------- Learning ---------------- */

export function LearningPage() {
  return (
    <InterestShell
      title="Learning New Technologies"
      intro="I like picking up new tools and ideas, and then building something with them to see if they stick. Here is what I am into right now.">
      <Section id="learning" title="What I am learning" icon={LightBulbIcon}>
        {learning.length === 0 ? (
          <Text color="secondary">My learning list is on its way. Check back soon.</Text>
        ) : (
          <div data-stagger>
            <Grid columns={{minWidth: 300, max: 2}} gap={8}>
              {learning.map((l) => (
                <div key={l.title} data-item>
                  <VStack gap={2}>
                    <Heading level={3} weight="semibold">{l.title}</Heading>
                    {l.note && <Text color="secondary" textWrap="pretty">{l.note}</Text>}
                    {l.tags.length > 0 && (
                      <HStack gap={1.5} wrap="wrap">
                        {l.tags.map((t) => <Token key={t} label={t} size="sm" />)}
                      </HStack>
                    )}
                  </VStack>
                </div>
              ))}
            </Grid>
          </div>
        )}
      </Section>
    </InterestShell>
  );
}
