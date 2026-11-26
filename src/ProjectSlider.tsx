import {useEffect, useRef, useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import gsap from 'gsap';
import {Carousel} from '@astryxdesign/core/Carousel';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {VStack} from '@astryxdesign/core/VStack';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import type {Project} from './content';
import {ProjectHero} from './ui';

const CARD_W = 360;
const GAP = 16; // Carousel gap={4}
const EDGE = 'var(--slider-edge)'; // the faded strip at each end (40px, 12px on phones); cards rest just inside it
const SPEED = 36; // px per second, right to left

function ProjectCard({p}: {p: Project}) {
  return (
    <div style={{width: `min(${CARD_W}px, 80vw)`, flex: 'none'}}>
      <RouterLink to={`/projects/${p.slug}`} style={{textDecoration: 'none', color: 'inherit', display: 'block'}}>
        <Card padding={4}>
          <VStack gap={3}>
            <ProjectHero project={p} />
            <VStack gap={0.5}>
              <Heading level={3} weight="semibold">{p.name}</Heading>
              <Text color="secondary" size="sm">{p.kind}</Text>
            </VStack>
            <Text textWrap="pretty">{p.summary}</Text>
          </VStack>
        </Card>
      </RouterLink>
    </div>
  );
}

/**
 * Projects slider: drifts right to left, stops while the pointer (or focus) is on it,
 * and moves a card at a time with the ← / → buttons or arrow keys.
 * The list is rendered twice so the loop is seamless; the copy is inert.
 */
export default function ProjectSlider({projects}: {projects: Project[]}) {
  const root = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const pos = useRef(0);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [current, setCurrent] = useState(0); // the project at the left edge, for the numbers underneath
  const shown = useRef(0);

  const scroller = () => root.current?.querySelector<HTMLElement>('.astryx-carousel-scroller') ?? null;
  const half = (el: HTMLElement) => cardStep(el) * projects.length; // one full set of cards (the end padding must not count)

  const cardStep = (el: HTMLElement) => ((el.firstElementChild as HTMLElement | null)?.offsetWidth ?? CARD_W) + GAP;
  const syncCurrent = (el: HTMLElement) => {
    const i = Math.round(pos.current / cardStep(el)) % projects.length;
    if (i !== shown.current) { shown.current = i; setCurrent(i); }
  };

  const wrap = (el: HTMLElement) => {
    const h = half(el);
    if (pos.current >= h) pos.current -= h;
    if (pos.current < 0) pos.current += h;
  };

  useEffect(() => {
    const el = scroller();
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.style.scrollBehavior = 'auto'; // we animate scrollLeft ourselves
    el.style.paddingInline = EDGE; // so a card at rest sits clear of the fade
    pos.current = el.scrollLeft;

    // Keep in sync when the user drags/swipes the scroller themselves.
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - pos.current) > 2) {
        pos.current = el.scrollLeft;
        wrap(el);
        el.scrollLeft = pos.current;
      }
      syncCurrent(el);
    };
    el.addEventListener('scroll', onScroll, {passive: true});

    const tick = (_t: number, deltaMs: number) => {
      if (reduce || paused.current || tween.current?.isActive()) return;
      pos.current += (SPEED * deltaMs) / 1000;
      wrap(el);
      el.scrollLeft = pos.current;
      syncCurrent(el);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener('scroll', onScroll);
      tween.current?.kill();
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = scroller();
    if (!el) return;
    tween.current?.kill();
    pos.current = el.scrollLeft;
    if (dir < 0 && pos.current < CARD_W + GAP) pos.current += half(el); // room to go left
    el.scrollLeft = pos.current;
    const to = pos.current + dir * (Math.min(CARD_W, window.innerWidth * 0.8) + GAP);
    const state = {v: pos.current};
    tween.current = gsap.to(state, {
      v: to, duration: 0.6, ease: 'power3.out',
      onUpdate: () => { pos.current = state.v; wrap(el); el.scrollLeft = pos.current; },
    });
  };

  /** Slide to project number i (0-based). */
  const goTo = (i: number) => {
    const el = scroller();
    if (!el) return;
    tween.current?.kill();
    const state = {v: el.scrollLeft};
    tween.current = gsap.to(state, {
      v: i * cardStep(el), duration: 0.8, ease: 'power3.inOut',
      onUpdate: () => { pos.current = state.v; el.scrollLeft = state.v; },
    });
  };

  const arrow = (side: 'left' | 'right') => (
    <div className="slider-arrow" style={{flex: 'none'}}>
      <Button
        isIconOnly
        label={side === 'left' ? 'Previous project' : 'Next project'}
        variant="secondary"
        icon={<Icon icon={side === 'left' ? 'chevronLeft' : 'chevronRight'} size="md" color="inherit" />}
        onClick={() => step(side === 'left' ? -1 : 1)}
      />
    </div>
  );

  return (
    <div>
    <div
      style={{display: 'flex', alignItems: 'center', gap: 12}}
      onPointerEnter={() => { paused.current = true; }}
      onPointerLeave={() => { paused.current = false; }}>
      {arrow('left')}
      <div
        ref={root}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Projects. Use the left and right arrow keys to browse."
        style={{
          outlineOffset: 4, flex: 1, minWidth: 0,
          // cards fade out at both ends instead of being cut off
          WebkitMaskImage: `linear-gradient(to right, transparent, #000 ${EDGE}, #000 calc(100% - ${EDGE}), transparent)`,
          maskImage: `linear-gradient(to right, transparent, #000 ${EDGE}, #000 calc(100% - ${EDGE}), transparent)`,
        }}
        onFocus={() => { paused.current = true; }}
        onBlur={() => { paused.current = false; }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        }}>
        <Carousel aria-label="Projects" gap={4} hasButtons={false}>
          {projects.map((p) => <ProjectCard key={p.slug} p={p} />)}
          {projects.map((p) => (
            <div key={`dup-${p.slug}`} aria-hidden="true" {...({inert: true} as object)}>
              <ProjectCard p={p} />
            </div>
          ))}
        </Carousel>
      </div>
      {arrow('right')}
    </div>
      <nav aria-label="Project numbers" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 16}}>
        {projects.map((p, i) => {
          const on = i === current;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Project ${i + 1}: ${p.name}`}
              aria-current={on ? 'true' : undefined}
              title={p.name}
              style={{
                width: 34, height: 28, borderRadius: 999, cursor: 'pointer', font: 'inherit', fontSize: 12, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums', border: '1px solid color-mix(in srgb, var(--fg) 25%, transparent)',
                background: on ? 'var(--fg)' : 'transparent', color: on ? 'var(--bg)' : 'var(--fg)', transition: 'background 0.2s ease, color 0.2s ease',
              }}>
              {String(i + 1).padStart(2, '0')}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
