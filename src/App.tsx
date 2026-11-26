import {useEffect, useState} from 'react';
import {BrowserRouter, Route, Routes, useLocation} from 'react-router-dom';
import {Theme} from '@astryxdesign/core/theme';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Button} from '@astryxdesign/core/Button';
import '../astryx-themes'; // loads the theme's CSS and fonts
import {siteTheme} from './theme';
import {DARK, LIGHT} from './palette';
import {getLenis, useMotion} from './motion';
import Home from './pages/Home';
import ProjectPage from './pages/ProjectPage';
import Footer from './Footer';
import {TravelPage, MusicPage, WatchingPage, GamingPage, LearningPage} from './pages/Interests';
import ThemeToggle from './ThemeToggle';
import SectionRail from './SectionRail';
import {toneStyle} from './ui';
import {useContentVersion} from './remote';
import AdminPage from './admin/AdminPage';

const page = {maxWidth: 880, marginInline: 'auto', width: '100%'} as const;

function Shell() {
  const [mode, setMode] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const {pathname} = useLocation();
  useEffect(() => {
    const c = mode === 'dark' ? DARK : LIGHT;
    document.documentElement.style.backgroundColor = c.bg;
    document.documentElement.style.setProperty('--bg', c.bg);
    document.documentElement.style.setProperty('--fg', c.ink);
  }, [mode]);
  useContentVersion(); // re-render when edited content arrives
  const isHome = pathname === '/';
  useMotion(pathname);

  // Every new page opens at the very top, whichever way you got there (link, back button, refresh).
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const go = () => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(0, {immediate: true});
      window.scrollTo(0, 0);
    };
    go();
    requestAnimationFrame(go);
  }, [pathname]);

  return (
    <Theme theme={siteTheme} mode={mode}>
      <Layout
        content={
          <LayoutContent role="main" padding={6}>
            <VStack gap={10} style={page}>
              {/* the top bar (section links + theme switch) is for the home page only */}
              {isHome && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8}}>
                  <div />
                  <HStack gap={2} align="center" wrap="wrap" justify="center">
                    <span className="nav-sec" style={toneStyle('about')}><Button label="About" variant="ghost" href="#about" /></span>
                    <span className="nav-sec" style={toneStyle('experience')}><Button label="Experience" variant="ghost" href="#experience" /></span>
                    <span className="nav-sec" style={toneStyle('education')}><Button label="Education" variant="ghost" href="#education" /></span>
                    <span className="nav-sec" style={toneStyle('projects')}><Button label="Projects" variant="ghost" href="#projects" /></span>
                    <span className="nav-sec" style={toneStyle('skills')}><Button label="Skills" variant="ghost" href="#skills" /></span>
                    <span className="nav-sec" style={toneStyle('achievements')}><Button label="Achievements" variant="ghost" href="#achievements" /></span>
                  </HStack>
                  <HStack justify="end" align="center">
                    <ThemeToggle mode={mode} onChange={setMode} />
                  </HStack>
                </div>
              )}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects/:slug" element={<ProjectPage />} />
                <Route path="/interests/travelling" element={<TravelPage />} />
                <Route path="/interests/music" element={<MusicPage />} />
                <Route path="/interests/watching" element={<WatchingPage />} />
                <Route path="/interests/gaming" element={<GamingPage />} />
                <Route path="/interests/learning" element={<LearningPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </VStack>
          </LayoutContent>
        }
      />
      <SectionRail pathname={pathname} />
      {isHome && <Footer />}
    </Theme>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
