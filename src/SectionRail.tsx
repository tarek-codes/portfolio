import {useEffect, useState} from 'react';
import {toneStyle} from './ui';
import './section-rail.css';

const SHORT: Record<string, string> = {
  about: 'About', experience: 'Experience', education: 'Education', projects: 'Projects', skills: 'Skills', learning: 'Learning',
  achievements: 'Achievements', overview: 'Overview', highlights: 'Highlights', pages: 'Live pages', next: 'Next',
};

/**
 * A timeline on the right edge of the page: one dot per section, the current one highlighted in its own colour.
 * Built from the page's own <section id> elements, so it works on every page that has sections.
 */
export default function SectionRail({pathname}: {pathname: string}) {
  const [items, setItems] = useState<{id: string; label: string}[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // find the sections once the page has rendered
  useEffect(() => {
    setActive(null);
    const find = () => {
      const els = [...document.querySelectorAll<HTMLElement>('[role=main] section[id], main section[id]')];
      setItems(els.map((e) => ({id: e.id, label: SHORT[e.id] ?? e.querySelector('h2')?.textContent ?? e.id})));
    };
    const t = setTimeout(find, 400);
    return () => clearTimeout(t);
  }, [pathname]);

  // track which section is at reading height
  useEffect(() => {
    if (!items.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current: string | null = null;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = it.id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [items]);

  if (items.length < 2) return null; // a timeline needs at least two stops
  return (
    <nav className="rail" aria-label="Sections on this page">
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={active === it.id ? 'on' : ''} aria-current={active === it.id ? 'true' : undefined} style={toneStyle(it.id)}>
              <span className="rail-label">{it.label}</span>
              <i className="rail-dot" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
