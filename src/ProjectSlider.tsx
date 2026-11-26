import {useEffect, useRef} from 'react';
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

  const scroller = () => root.current?.querySelector<HTMLElement>('.astryx-carousel-scroller') ?? null;
  const half = (el: HTMLElement) => el.scrollWidth / 2;

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
    pos.current = el.scrollLeft;

    // Keep in sync when the user drags/swipes the scroller themselves.
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - pos.current) > 2) {
        pos.current = el.scrollLeft;
        wrap(el);
        el.scrollLeft = pos.current;
      }
    };
    el.addEventListener('scroll', onScroll, {passive: true});

    const tick = (_t: number, deltaMs: number) => {
      if (reduce || paused.current || tween.current?.isActive()) return;
      pos.current += (SPEED * deltaMs) / 1000;
      wrap(el);
      el.scrollLeft = pos.current;
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

  const arrow = (side: 'left' | 'right') => (
    <div style={{flex: 'none'}}>
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
        style={{outlineOffset: 4, flex: 1, minWidth: 0}}
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
  );
}
