import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral';
import {DARK, LIGHT} from './palette';

/** The Astryx neutral theme with white light mode and near-black ink. */
export const siteTheme = defineTheme({
  name: 'portfolio',
  extends: neutralTheme,
  tokens: {
    '--color-background-surface': [LIGHT.surface, DARK.surface],
    '--color-background-muted': [LIGHT.muted, DARK.muted],
    // cards (the project slideshow), popovers and carousel buttons use their own tokens, which are pure white by default
    '--color-background-card': [LIGHT.surface, '#1b1b1b'],
    '--color-background-popover': [LIGHT.surface, '#1b1b1b'],
    '--color-background-body': [LIGHT.bg, '#1b1b1b'],
    '--color-text-primary': [LIGHT.ink, DARK.ink],
    '--color-text-secondary': [LIGHT.ink2, DARK.ink2],
    '--color-border-emphasized': [LIGHT.border, DARK.border],
  },
});
