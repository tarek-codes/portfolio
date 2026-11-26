import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Token} from '@astryxdesign/core/Token';
import {Badge} from '@astryxdesign/core/Badge';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {profile, about, experience, education, projects, skills, achievements} from '../content';
import {Logo, Section, BulletList, SkillPill} from '../ui';
import {Icon} from '@astryxdesign/core/Icon';
import {brandIcons, skillIcons} from '../icons';
import {ComputerDesktopIcon, UserCircleIcon, BriefcaseIcon, AcademicCapIcon, RectangleStackIcon, WrenchScrewdriverIcon, TrophyIcon} from '@heroicons/react/24/outline';
import ProjectSlider from '../ProjectSlider';

export default function Home() {
  const navigate = useNavigate();
  return (
    <>
      <VStack gap={4} style={{paddingBlock: 'var(--hero-pad)'}}>
        <div data-hero><Heading level={1} type="display-1" textWrap="balance" className="hero-name">{profile.name}</Heading></div>
        <div data-hero>
          <HStack gap={3} wrap="wrap">
            {profile.links.map((l) => (
              <span key={l.label} className={`brand brand-${l.label.toLowerCase()}`}>
              <Button
                label={l.label}
                variant="secondary"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                icon={brandIcons[l.label as keyof typeof brandIcons] ? <Icon icon={brandIcons[l.label as keyof typeof brandIcons]} size="sm" color="inherit" /> : undefined}
              />
              </span>
            ))}
            <span className="brand brand-setup">
              <Button
                label="My Setup"
                variant="secondary"
                onClick={() => navigate('/setup')}
                icon={<Icon icon={ComputerDesktopIcon} size="sm" color="inherit" />}
              />
            </span>
          </HStack>
        </div>
        <div data-hero><Text type="large" color="secondary" textWrap="balance">{profile.role}</Text></div>
        <div data-hero><Text textWrap="pretty">{profile.summary}</Text></div>
      </VStack>

      <Section id="about" title="About Me" icon={UserCircleIcon}>
        <div data-reveal>
          {/* photo and text sit together, vertically centred; they stack on narrow screens */}
          <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 56}}>
            <div style={{flex: '0 0 auto', maxWidth: '100%'}}>
              <img className="about-photo" src={about.photo} alt={`Portrait of ${profile.name}`} />
            </div>
            <VStack gap={5} style={{flex: '1 1 340px', minWidth: 0, gap: 'var(--text-gap)'}}>
              {about.paragraphs.map((t) => <Text key={t} textWrap="pretty">{t}</Text>)}
              <VStack gap={1.5}>
                <Text color="secondary" size="sm">Professional Interests</Text>
                <HStack gap={1.5} wrap="wrap">
                  {about.interests.map((i) => <Token key={i} label={i} />)}
                </HStack>
              </VStack>
              <VStack gap={1.5}>
                <Text color="secondary" size="sm">Outside of Work</Text>
                <HStack gap={1.5} wrap="wrap">
                  {about.hobbies.map((h) =>
                    h.to?.startsWith('#') ? (
                      <a key={h.label} href={h.to} style={{textDecoration: 'none'}} aria-label={`${h.label}: jump to the section`}>
                        <Badge label={`${h.label} →`} variant="neutral" />
                      </a>
                    ) : h.to ? (
                      <RouterLink key={h.label} to={h.to} style={{textDecoration: 'none'}} aria-label={`${h.label}: open page`}>
                        <Badge label={`${h.label} →`} variant="neutral" />
                      </RouterLink>
                    ) : (
                      <Badge key={h.label} label={h.label} variant="neutral" />
                    ),
                  )}
                </HStack>
              </VStack>
            </VStack>
          </div>
        </div>
      </Section>

      <Section id="experience" title="Experience" icon={BriefcaseIcon}>
        <div data-stagger>
          <VStack gap={10}>
            {([['work', 'Work Experience'], ['research', 'Research Experience']] as const).map(([kind, label]) => (
              <div key={kind} data-item>
                <VStack gap={8}>
                  <Text color="secondary" size="sm" weight="semibold">{label}</Text>
                  {experience.filter((e) => e.kind === kind).map((e) => (
                    <HStack key={e.org} gap={4} align="start">
                      <Logo src={e.logo} name={e.org} bg={e.logoBg} initials={e.initials} />
                      <VStack gap={2} width="100%">
                        <HStack justify="between" wrap="wrap" gap={2}>
                          <Text weight="semibold">{e.role}</Text>
                          <Text color="secondary">{e.when}</Text>
                        </HStack>
                        <Text>{e.org} <Text color="secondary">· {e.where}</Text></Text>
                        {e.points.length > 0 && <BulletList items={e.points} />}
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </div>
            ))}
          </VStack>
        </div>
      </Section>

      <Section id="education" title="Education" icon={AcademicCapIcon}>
        <div data-stagger>
          <VStack gap={10}>
            {education.map((e) => (
              <div key={e.school} data-item>
                <HStack gap={4} align="start">
                  <Logo src={e.logo} name={e.school} bg={e.logoBg} initials={e.initials} />
                  <VStack gap={2} width="100%">
                    <HStack justify="between" wrap="wrap" gap={2}>
                      <Text weight="semibold">{e.degree}</Text>
                      <Text color="secondary">{e.when}</Text>
                    </HStack>
                    <Text>{e.school} <Text color="secondary">· {e.where}</Text></Text>
                    {e.note && <Text textWrap="pretty">{e.note}</Text>}
                  </VStack>
                </HStack>
              </div>
            ))}
          </VStack>
        </div>
      </Section>

      <Section id="projects" title="Projects" icon={RectangleStackIcon}>
        <div data-reveal><ProjectSlider projects={projects} /></div>
      </Section>

      <Section id="skills" title="Skills" icon={WrenchScrewdriverIcon}>
        <div data-stagger>
          <VStack gap={6}>
            {skills.map((s) => (
              <div key={s.group} data-item>
                <VStack gap={3}>
                  <Text color="secondary" size="sm">{s.group}</Text>
                  <HStack gap={1.5} wrap="wrap">
                    {s.items.map((i) => <SkillPill key={i} name={i} icon={skillIcons[i]} />)}
                  </HStack>
                </VStack>
              </div>
            ))}
          </VStack>
        </div>
      </Section>

      <Section id="achievements" title="Achievements & Certificates" icon={TrophyIcon}>
        <VStack gap={10}>
          {(['Hackathons', 'Certifications', 'Training'] as const).map((group) => {
            const items = achievements.filter((a) => ((a as {group?: string}).group ?? 'Certifications') === group);
            if (!items.length) return null;
            return (
              <VStack gap={3} key={group}>
                <div data-reveal><Heading level={3} weight="semibold">{group}</Heading></div>
                <div data-stagger style={{display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))'}}>
                  {items.map((a) => (
                    <div key={a.title} data-item style={{border: '1px solid rgba(128,128,128,0.35)', borderRadius: 12, padding: 16}}>
                      <VStack gap={3}>
                        <VStack gap={0.5}>
                          {a.href
                            ? <Link href={a.href} isExternalLink color="primary" hasUnderline weight="semibold">{a.title}</Link>
                            : <Text weight="semibold">{a.title}</Text>}
                          {a.note && <Text color="secondary">{a.note}</Text>}
                        </VStack>
                        {a.image && (
                          <a href={a.imageHref ?? a.href} target="_blank" rel="noopener noreferrer" style={{display: 'block'}}>
                            <img
                              src={a.image}
                              alt={a.imageAlt}
                              loading="lazy"
                              style={{width: '100%', borderRadius: 8, display: 'block'}}
                            />
                          </a>
                        )}
                      </VStack>
                    </div>
                  ))}
                </div>
              </VStack>
            );
          })}
        </VStack>
      </Section>
    </>
  );
}
