import {useEffect, useState} from 'react';
import {BrowserRouter, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
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
import {useContentVersion} from './remote';
import AdminPage from './admin/AdminPage';

const page = {maxWidth: 880, marginInline: 'auto', width: '100%'} as const;

function Shell() {
  const [mode, setMode] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const {pathname, state} = useLocation();
  useEffect(() => {
    const c = mode === 'dark' ? DARK : LIGHT;
    document.documentElement.style.backgroundColor = c.bg;
    document.documentElement.style.setProperty('--bg', c.bg);
    document.documentElement.style.setProperty('--fg', c.ink);
  }, [mode]);
  useContentVersion(); // re-render when edited content arrives
  const navigate = useNavigate();
  const isHome = pathname === '/';
  useMotion(pathname);

  // New route: jump to top, or to the section the link asked for.
  useEffect(() => {
    const target = (state as {scroll?: string} | null)?.scroll;
    const go = () => {
      const el = target ? document.getElementById(target) : null;
      const lenis = getLenis();
      if (el) lenis ? lenis.scrollTo(el, {immediate: true, offset: -24}) : el.scrollIntoView();
      else lenis ? lenis.scrollTo(0, {immediate: true}) : window.scrollTo(0, 0);
    };
    requestAnimationFrame(go);
  }, [pathname, state]);

  return (
    <Theme theme={siteTheme} mode={mode}>
      <Layout
        content={
          <LayoutContent role="main" padding={6}>
            <VStack gap={10} style={page}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8}}>
                <div />
                <HStack gap={2} align="center" wrap="wrap" justify="center">
                  {isHome ? (
                    <>
                      <Button label="About" variant="ghost" href="#about" />
                      <Button label="Experience" variant="ghost" href="#experience" />
                      <Button label="Education" variant="ghost" href="#education" />
                      <Button label="Projects" variant="ghost" href="#projects" />
                    </>
                  ) : (
                    <Button label="Home" variant="ghost" onClick={() => navigate('/')} />
                  )}
                </HStack>
                <HStack justify="end" align="center">
                  <ThemeToggle mode={mode} onChange={setMode} />
                </HStack>
              </div>
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
