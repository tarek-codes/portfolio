import {useEffect, useState} from 'react';
import gsap from 'gsap';
import {profile} from './content';
import {visitorCount} from './visitors';
import './footer.css';

const lift = (el: HTMLElement, y: number) => gsap.to(el, {y, duration: 0.35, ease: 'power3.out', overwrite: 'auto'});

export default function Footer() {
  const [visitors, setVisitors] = useState<number | null>(null);
  useEffect(() => { void visitorCount().then(setVisitors); }, []);
  return (
    <footer className="tfoot" data-footer>
      <div className="tf-wrap">
        <div className="tf-cta" data-foot-in>
          <div>
            <h2>Got an idea? <span className="tf-hl">Let&rsquo;s build it.</span></h2>
            <p>Open to software engineering and AI/ML roles, and always up for a good laugh.</p>
          </div>
          <div className="tf-btns">
            <a className="tf-go" href={`mailto:${profile.email}`}>Email me <span aria-hidden="true">→</span></a>
            <a className="tf-ghost" href={(profile.links.find((l) => l.label === 'LinkedIn') ?? profile.links[0])?.href ?? '#'} target="_blank" rel="noopener noreferrer">Connect on LinkedIn <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        {visitors !== null && <p className="tf-count">{visitors.toLocaleString()} unique {visitors === 1 ? 'visitor' : 'visitors'}</p>}
      </div>

      <div className="tf-word" aria-hidden="true">
        {'TAREK'.split('').map((c, i) => (
          <span className="tf-mask" key={i}>
            <span
              className="tf-ch"
              data-letter
              onPointerEnter={(e) => lift(e.currentTarget, -18)}
              onPointerLeave={(e) => lift(e.currentTarget, 0)}>
              {c}
            </span>
          </span>
        ))}
      </div>
    </footer>
  );
}
