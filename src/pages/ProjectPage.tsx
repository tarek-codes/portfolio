import {Link as RouterLink, Navigate, useParams} from 'react-router-dom';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Token} from '@astryxdesign/core/Token';
import {Carousel} from '@astryxdesign/core/Carousel';
import {projects} from '../content';
import {InformationCircleIcon, SparklesIcon, ComputerDesktopIcon, ArrowRightIcon} from '@heroicons/react/24/outline';
import {Section, ProjectHero, BulletList} from '../ui';

export default function ProjectPage() {
  const {slug} = useParams();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return <Navigate to="/" replace />;
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <>
      <VStack gap={4} paddingBlock={4}>
        <div data-hero>
          <RouterLink to="/" state={{scroll: 'projects'}} style={{color: 'inherit'}}>
            <Text color="secondary">← All Projects</Text>
          </RouterLink>
        </div>
        <div data-hero><Text color="secondary">{p.kind}</Text></div>
        <div data-hero><Heading level={1} type="display-1" textWrap="balance">{p.name}</Heading></div>
        <div data-hero><Text type="large" color="secondary" textWrap="balance">{p.summary}</Text></div>
        <div data-hero>
          <HStack gap={3} wrap="wrap">
            {p.live && <Button label="Visit Live Site" variant="primary" href={p.live} target="_blank" rel="noopener noreferrer" />}
            {p.code && <Button label="View Code" variant="secondary" href={p.code} target="_blank" rel="noopener noreferrer" />}
          </HStack>
        </div>
      </VStack>

      <div data-hero><ProjectHero project={p} /></div>

      <Section id="overview" title="Overview" icon={InformationCircleIcon}>
        <VStack gap={4}>
          <Text textWrap="pretty">{p.overview}</Text>
          {p.stack.length > 0 && (
            <HStack gap={1.5} wrap="wrap">
              {p.stack.map((s) => <Token key={s} label={s} />)}
            </HStack>
          )}
        </VStack>
      </Section>

      <Section id="highlights" title="Highlights" icon={SparklesIcon}>
        <div data-reveal><BulletList items={p.highlights} /></div>
      </Section>

      {p.shots && p.shots.length > 1 && (
        <Section id="pages" title="Live Pages" icon={ComputerDesktopIcon}>
          <div data-reveal>
            <Carousel aria-label={`${p.name} pages`} gap={4} hasSnap hasLoop>
              {p.shots.map((w) => (
                <div key={w.src} style={{width: 'min(560px, 85vw)', flex: 'none'}}>
                  <VStack gap={2}>
                    <div style={{border: '1px solid rgba(128,128,128,0.35)', borderRadius: 12, overflow: 'hidden', aspectRatio: '16 / 10'}}>
                      <img src={w.src} alt={`${p.name} ${w.page} page`} loading="lazy"
                        style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
                    </div>
                    <HStack justify="between" gap={2}>
                      <Text weight="semibold">{w.page}</Text>
                      <Link href={w.href} isExternalLink color="primary" hasUnderline>Visit</Link>
                    </HStack>
                  </VStack>
                </div>
              ))}
            </Carousel>
          </div>
        </Section>
      )}

      <Section id="next" title="Next Project" icon={ArrowRightIcon}>
        <RouterLink to={`/projects/${next.slug}`} style={{color: 'inherit', textDecoration: 'none'}}>
          <VStack gap={0.5}>
            <Heading level={3} weight="semibold">{next.name} →</Heading>
            <Text color="secondary">{next.summary}</Text>
          </VStack>
        </RouterLink>
      </Section>
    </>
  );
}
