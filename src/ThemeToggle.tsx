import {useEffect, useRef} from 'react';
import {createPortal, flushSync} from 'react-dom';
import type {SVGProps} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {createThemeSwitch, type ThemeName, type ThemeSwitchEngine} from './theme-rain/engine';
import './theme-rain/theme-rain.css';

// Icons from Pin UI's theme switch: the moon on the light face (press for dark), the sun on the dark face.
function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20.985 12.486C20.8913 14.2221 20.2967 15.894 19.2731 17.2994C18.2495 18.7048 16.8407 19.7837 15.217 20.4055C13.5934 21.0274 11.8243 21.1656 10.1238 20.8035C8.42322 20.4414 6.86395 19.5945 5.63446 18.3652C4.40497 17.1358 3.55789 15.5766 3.19562 13.8761C2.83334 12.1756 2.97139 10.4065 3.59308 8.78282C4.21476 7.15909 5.29346 5.75019 6.69877 4.72644C8.10409 3.70268 9.77586 3.1079 11.512 3.014C11.917 2.992 12.129 3.474 11.914 3.817C11.1949 4.96755 10.887 6.32787 11.0405 7.67595C11.194 9.02403 11.7999 10.2803 12.7593 11.2397C13.7187 12.1991 14.975 12.805 16.323 12.9585C17.6711 13.112 19.0314 12.8041 20.182 12.085C20.526 11.87 21.007 12.081 20.985 12.486Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34" />
      </g>
    </svg>
  );
}

/**
 * Light/dark toggle. Pressing it drops a drop of the next theme's colour onto the icon; it splashes and floods
 * the whole page from where it landed, and the page switches the moment it is covered. With reduced motion it switches at once.
 */
export default function ThemeToggle({mode, onChange}: {mode: ThemeName; onChange: (m: ThemeName) => void}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const fx = useRef<HTMLDivElement>(null);
  const engine = useRef<ThemeSwitchEngine | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const button = wrap.current?.querySelector('button');
    if (!button || !root.current || !fx.current) return;
    const e = createThemeSwitch({
      root: root.current,
      button,
      fx: fx.current,
      effect: () => 'droplet',
      sound: () => false,
      onCommit: (next) => flushSync(() => onChangeRef.current(next)),
    });
    engine.current = e;
    return () => { e.destroy(); engine.current = null; };
  }, []);

  // A theme change from outside (not our own switch) lands at once.
  useEffect(() => {
    if (root.current && !engine.current?.busy()) root.current.dataset.theme = mode;
  }, [mode]);

  const next = mode === 'dark' ? 'light' : 'dark';
  return (
    <>
      <span ref={wrap} className="pts-btn">
        <Button
          isIconOnly
          label={`Switch to ${next} theme`}
          variant="secondary"
          icon={<Icon icon={mode === 'dark' ? SunIcon : MoonIcon} size="md" color="inherit" />}
        />
      </span>
      {createPortal(
        <div ref={root} className="pts" data-theme={mode} data-effect="droplet" data-fill aria-hidden="true">
          <div ref={fx} className="pts__fx" />
        </div>,
        document.body,
      )}
    </>
  );
}
