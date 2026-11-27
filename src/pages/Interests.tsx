import {useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Grid} from '@astryxdesign/core/Grid';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {Card} from '@astryxdesign/core/Card';
import {Link} from '@astryxdesign/core/Link';
import {Button} from '@astryxdesign/core/Button';
import {Token} from '@astryxdesign/core/Token';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {travel, playlists, watched, games, learning, type Place, type Spot} from '../content';
import {DISTRICTS} from '../bd-map';
import TravelMap from '../TravelMap';
import {Section} from '../ui';
import {InterestShell} from './shell';
import {MusicalNoteIcon, FilmIcon, TvIcon, PuzzlePieceIcon, LightBulbIcon} from '@heroicons/react/24/outline';

/* ---------------- Travelling ---------------- */

const ink = (pct: number) => `color-mix(in srgb, var(--fg) ${pct}%, transparent)`;
const VISITED = 'light-dark(#10b981, #34d399)'; // legend and progress bar
const VISITED_TEXT = 'light-dark(#047857, #34d399)'; // the same green, deep enough to read as text on the white page

export function TravelPage() {
  const [focus, setFocus] = useState<string | null>(null); // the place the map is zoomed on
  const [spot, setSpot] = useState<string | null>(null); // a spot being pointed at
  const [hover, setHover] = useState<string | null>(null); // a district being pointed at
  const [factSpot, setFactSpot] = useState<{place: Place; spot: Spot} | null>(null); // the spot whose popup (fact + hero image) is open
  const openSpot = (p: Place, sp: Spot) => { if (sp.fact) setFactSpot({place: p, spot: sp}); };
  const mapBox = useRef<HTMLDivElement | null>(null);

  // every district that has a place or a spot in it
  const visited = useMemo(() => {
    const set = new Set<string>();
    travel.forEach((p) => { if (p.district) set.add(p.district); p.spots.forEach((s) => s.district && set.add(s.district)); });
    return set;
  }, [travel.length, travel.map((p) => p.district + p.spots.map((s) => s.district).join()).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomTo = (id: string | null) => {
    setFocus(id);
    setSpot(null);
    // the list sits below the map: if the map has scrolled out of view, bring it back so the zoom is seen
    const box = mapBox.current?.getBoundingClientRect();
    if (id && box && (box.top < 0 || box.bottom > window.innerHeight)) mapBox.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
  };

  const pickDistrict = (name: string) => {
    const p = travel.find((x) => x.district === name) ?? travel.find((x) => x.spots.some((s) => s.district === name));
    if (p) zoomTo(p.id);
  };

  const zoomed = focus !== null;
  const place = travel.find((p) => p.id === focus);
  const count = visited.size;

  return (
    <InterestShell
      title="Travelling"
      intro="I love getting out of Dhaka. This map colours in the districts of Bangladesh I have visited.">
      <div data-reveal>
        <VStack gap={8}>
          <div style={{maxWidth: 780, width: '100%', marginInline: 'auto'}}>
            {/* the running count, like Unseen Bangladesh */}
            <div style={{marginBottom: 12, maxWidth: 520, marginInline: 'auto'}}>
              <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8}}>
                <span style={{fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: VISITED_TEXT}}>{count}</span>
                <span style={{fontSize: 16, color: ink(80)}}>of {DISTRICTS.length} districts visited</span>
              </div>
              <div style={{height: 6, borderRadius: 999, background: ink(10), marginTop: 8, overflow: 'hidden'}} role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={DISTRICTS.length}>
                <div style={{height: '100%', width: `${(count / DISTRICTS.length) * 100}%`, background: VISITED, borderRadius: 999, transition: 'width 0.6s ease'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, fontSize: 13, color: ink(80)}}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><i style={{width: 12, height: 12, borderRadius: 4, background: VISITED, display: 'inline-block'}} />Visited ({count})</span>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><i style={{width: 12, height: 12, borderRadius: 4, background: ink(9), border: `1px solid ${ink(25)}`, display: 'inline-block'}} />Not yet ({DISTRICTS.length - count})</span>
              </div>
            </div>

            <div ref={mapBox} style={{position: 'relative', scrollMarginTop: 16}}>
              {(place || hover) && (
                <div
                  style={{
                    position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap',
                    background: 'var(--fg)', color: 'var(--bg)', fontSize: 13, fontWeight: 600, pointerEvents: 'none',
                  }}>
                  {hover ? `${hover} · ${visited.has(hover) ? 'visited' : 'not yet'}` : `${place!.name} · ${place!.area}`}
                </div>
              )}
              <TravelMap
                places={travel}
                visited={visited}
                focus={place}
                hoverSpot={spot}
                onPickDistrict={pickDistrict}
                onHoverDistrict={setHover}
                onOpenSpot={openSpot}
                onHoverSpot={setSpot}
              />
            </div>
            {zoomed && (
              <div style={{textAlign: 'center', marginTop: 8}}>
                <Button label="Show the whole map" variant="secondary" onClick={() => zoomTo(null)} />
              </div>
            )}
          </div>

          <div style={{width: '100%', maxWidth: 880, marginInline: 'auto'}}>
            <Text color="secondary" size="sm" style={{marginBottom: 10, textAlign: 'center'}}>{place ? 'Tap a spot to see a picture and an interesting fact about it. Tap the place again to go back to the whole map.' : 'Pick a place to zoom in, then tap any spot to see a picture and an interesting fact. You can also tap a green district on the map.'}</Text>
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
                      <span style={{fontSize: 12, fontWeight: 600, color: ink(80), fontVariantNumeric: 'tabular-nums'}}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={{fontSize: 17, fontWeight: on ? 700 : 500}}>{p.name}</span>
                      <span style={{marginLeft: 'auto', fontSize: 13, color: ink(82), whiteSpace: 'nowrap'}}>{p.spots.length} places</span>
                    </button>
                    {on && (
                      <ol aria-label={`Places in ${p.name}`} style={{margin: 0, padding: '2px 10px 14px 44px', listStyle: 'none', columnWidth: 170, columnGap: 20}}>
                        {p.spots.map((s2, i) => (
                          <li
                            key={s2.name}
                            onMouseEnter={() => setSpot(s2.name)}
                            onMouseLeave={() => setSpot(null)}
                            style={{breakInside: 'avoid', opacity: !spot || spot === s2.name ? 1 : 0.45, transition: 'opacity 0.2s ease'}}>
                            <button
                              type="button"
                              className="spot-btn"
                              aria-haspopup={s2.fact ? 'dialog' : undefined}
                              disabled={!s2.fact}
                              onClick={() => openSpot(p, s2)}
                              style={{display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '4px 0', border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontSize: 15, textAlign: 'left', cursor: s2.fact ? 'pointer' : 'default'}}>
                              <span aria-hidden="true" style={{flex: 'none', width: 20, height: 20, borderRadius: 999, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, background: 'var(--fg)', color: 'var(--bg)'}}>{i + 1}</span>
                              <span className="spot-name">{s2.name}</span>
                              {s2.fact && <span aria-hidden="true" style={{marginLeft: 'auto', fontSize: 13, opacity: 0.6}}>→</span>}
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })}
              <li style={{borderTop: `1px solid ${ink(14)}`}} aria-hidden="true" />
            </ul>

          </div>
        </VStack>
      </div>

      <Dialog isOpen={Boolean(factSpot)} onOpenChange={(open) => { if (!open) setFactSpot(null); }} width={560} padding={0}>
        {factSpot && (
          <>
            <div style={{padding: '12px 16px 12px 20px'}}>
              <DialogHeader title={factSpot.spot.name} subtitle={`${factSpot.place.name} · ${factSpot.place.area}`} hasDivider={false} onOpenChange={(open) => { if (!open) setFactSpot(null); }} />
            </div>
            {factSpot.spot.image && (
              <img
                src={factSpot.spot.image}
                alt={factSpot.spot.imageAlt ?? factSpot.spot.name}
                style={{width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block'}}
              />
            )}
            <div style={{padding: 20}}>
              <VStack gap={2}>
                <Text color="secondary" size="sm" weight="semibold">Did you know?</Text>
                <Text textWrap="pretty">{factSpot.spot.fact}</Text>
                {factSpot.spot.imageCredit && (
                  <Text color="secondary" size="sm">
                    {factSpot.spot.imageCreditHref
                      ? <Link href={factSpot.spot.imageCreditHref} isExternalLink color="secondary" hasUnderline>{factSpot.spot.imageCredit}</Link>
                      : factSpot.spot.imageCredit}
                  </Text>
                )}
              </VStack>
            </div>
          </>
        )}
      </Dialog>
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
