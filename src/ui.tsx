import type {ComponentType, ReactNode, SVGProps} from 'react';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Divider} from '@astryxdesign/core/Divider';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import type {Project} from './content';
import {skillColor} from './icons';

export function Logo({src, name, bg, initials}: {src?: string; name: string; bg?: string; initials?: string}) {
  return (
    <div
      style={{
        width: 48, height: 48, flex: 'none', borderRadius: 10, background: bg ?? '#000', color: '#fff',
        border: '1px solid rgba(128,128,128,0.35)', display: 'grid', placeItems: 'center', overflow: 'hidden',
        fontSize: 14, fontWeight: 600, letterSpacing: '0.02em',
      }}>
      {src ? (
        <img src={src} alt={`${name} logo`} style={{width: '100%', height: '100%', objectFit: 'contain', padding: 6}} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

/** One colour pair per section: [light-mode background, light-mode text, dark-mode background, dark-mode text]. */
export const TONES: Record<string, [string, string, string, string]> = {
  about: ['#fde68a', '#78350f', '#78350f', '#fde68a'],
  experience: ['#bfdbfe', '#1e3a8a', '#1e3a8a', '#bfdbfe'],
  education: ['#bbf7d0', '#14532d', '#14532d', '#bbf7d0'],
  projects: ['#fbcfe8', '#831843', '#831843', '#fbcfe8'],
  skills: ['#ddd6fe', '#4c1d95', '#4c1d95', '#ddd6fe'],
  achievements: ['#fed7aa', '#7c2d12', '#7c2d12', '#fed7aa'],
  overview: ['#99f6e4', '#134e4a', '#134e4a', '#99f6e4'],
  highlights: ['#fef08a', '#713f12', '#713f12', '#fef08a'],
  pages: ['#bae6fd', '#0c4a6e', '#0c4a6e', '#bae6fd'],
  next: ['#fecdd3', '#881337', '#881337', '#fecdd3'],
  playlists: ['#a5f3fc', '#164e63', '#164e63', '#a5f3fc'],
  watched: ['#fecaca', '#7f1d1d', '#7f1d1d', '#fecaca'],
  series: ['#c7d2fe', '#312e81', '#312e81', '#c7d2fe'],
  movie: ['#fecaca', '#7f1d1d', '#7f1d1d', '#fecaca'],
  games: ['#d9f99d', '#365314', '#365314', '#d9f99d'],
  learning: ['#f5d0fe', '#701a75', '#701a75', '#f5d0fe'],
};
export const FALLBACK: [string, string, string, string] = ['#e5e7eb', '#111827', '#374151', '#f3f4f6'];

/** The pill colours of a section as CSS variables (light-mode / dark-mode pair). */
export function toneStyle(id: string) {
  const [lb, lf, db, df] = TONES[id] ?? FALLBACK;
  return {['--pill-bg' as string]: `light-dark(${lb}, ${db})`, ['--pill-fg' as string]: `light-dark(${lf}, ${df})`};
}

export function Section({id, title, icon, children}: {id: string; title: string; icon?: ComponentType<SVGProps<SVGSVGElement>>; children: ReactNode}) {
  return (
    // every section after About Me gets extra breathing room above it
    <VStack gap={6} as="section" id={id} style={{marginTop: id === 'about' ? 0 : 56}}>
      <div data-reveal><Divider /></div>
      <div data-reveal>
        <div
          className="sec-pill"
          style={toneStyle(id)}>
          {icon && <Icon icon={icon} size="lg" color="inherit" />}
          <Heading level={2} type="display-3" color="inherit">{title}</Heading>
        </div>
      </div>
      {children}
    </VStack>
  );
}

const frame = {
  border: '1px solid rgba(128,128,128,0.35)', borderRadius: 12, overflow: 'hidden', aspectRatio: '16 / 10',
} as const;

/** Hero image for a project: its live screenshot, or a typographic tile when it has none. */
export function ProjectHero({project}: {project: Project}) {
  if (project.hero) {
    return (
      <div style={frame}>
        <img src={project.hero} alt={`${project.name} screenshot`} loading="lazy"
          style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`${project.name} cover`}
      style={{
        ...frame, background: '#000', color: '#fff', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: 20,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}>
      <span style={{fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6}}>{project.kind}</span>
      <span style={{fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.02em'}}>{project.name}</span>
    </div>
  );
}

export function BulletList({items}: {items: string[]}) {
  return (
    <ul style={{margin: 0, paddingInlineStart: 20, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 6}}>
      {items.map((t) => (
        <li key={t}><Text textWrap="pretty">{t}</Text></li>
      ))}
    </ul>
  );
}

/** A skill as a pill in its own colour: a tinted fill, a matching outline and a coloured logo. */
export function SkillPill({name, icon}: {name: string; icon?: ComponentType<SVGProps<SVGSVGElement>>}) {
  return (
    <span className="skill" style={{['--c' as string]: skillColor(name)}}>
      {icon && <Icon icon={icon} size="xsm" color="inherit" />}
      <span>{name}</span>
    </span>
  );
}
