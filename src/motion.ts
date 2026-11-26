import {useEffect} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/** Lenis smooth scroll driven by GSAP's ticker, plus scroll-triggered reveals. */
let current: Lenis | null = null;
export const getLenis = () => current;

export function useMotion(routeKey: string) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const lenis = new Lenis({duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3)});
    current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchor links scroll through Lenis.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href')!);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, {offset: -24});
    };
    document.addEventListener('click', onClick);

    // What is already on screen when the page opens at the top needs no entrance effect: it just appears.
    const firstScreen = (el: Element) => el.getBoundingClientRect().top + window.scrollY < window.innerHeight * 0.88;
    const below = (el: HTMLElement) => !firstScreen(el);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').filter(below).forEach((el) => {
        gsap.from(el, {
          y: 32, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: {trigger: el, start: 'top 88%', once: true},
        });
      });
      // Section headers: the icon is drawn stroke by stroke, then the title is typed out, as each one scrolls into view
      // (About Me too: it is on screen at the start, so it plays as soon as the page opens).
      gsap.utils.toArray<HTMLElement>('.sec-pill').forEach((pill) => {
        const title = pill.querySelector<HTMLElement>('h2');
        const paths = Array.from(pill.querySelectorAll<SVGGeometryElement>('svg path, svg circle, svg line, svg polyline, svg rect'));
        const tl = gsap.timeline({scrollTrigger: {trigger: pill, start: 'top 88%', once: true}});
        paths.forEach((p) => {
          const len = typeof p.getTotalLength === 'function' ? p.getTotalLength() : 0;
          if (!len) return;
          p.style.strokeDasharray = String(len);
          tl.fromTo(p, {strokeDashoffset: len}, {
            strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut',
            onComplete: () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; },
          }, 0);
        });
        if (title) {
          const chars = Math.max(1, (title.textContent ?? '').length);
          // revealed in steps, one per character: reads as typing without touching the text itself
          tl.fromTo(title, {clipPath: 'inset(0 100% 0 0)'}, {
            clipPath: 'inset(0 0% 0 0)', duration: chars * 0.085, ease: `steps(${chars})`,
            onComplete: () => { title.style.clipPath = ''; },
          }, 0.45);
        }
      });
      // Footer: blocks rise in, the giant wordmark's letters slide up from behind their masks.
      if (document.querySelector('[data-footer]')) {
        gsap.from('[data-foot-in]', {
          y: 36, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: {trigger: '[data-footer]', start: 'top 80%', once: true},
        });
        gsap.from('[data-letter]', {
          yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: 0.09,
          scrollTrigger: {trigger: '.tf-word', start: 'top 98%', once: true},
        });
      }
      gsap.utils.toArray<HTMLElement>('[data-stagger]').filter(below).forEach((group) => {
        gsap.from(group.querySelectorAll('[data-item]'), {
          y: 32, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: {trigger: group, start: 'top 85%', once: true},
        });
      });
    });

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      ctx.revert();
      lenis.destroy();
      current = null;
    };
  }, [routeKey]);
}
