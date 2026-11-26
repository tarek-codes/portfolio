/**
 * The site's page colours, in one place. Light mode is a soft sand (not white) so it is easy on the eyes; dark mode is unchanged.
 * Used by: the Astryx theme (src/theme.ts), the <html> background and the --bg/--fg variables (App.tsx),
 * and the theme-change flood (src/theme-rain/engine.ts), which must match the page exactly or it would flash.
 */
export const LIGHT = {
  bg: '#e6dfcf', // the page
  surface: '#efe9db', // cards, raised surfaces
  muted: '#d8d0bd', // chips, subtle fills
  border: '#c9bfa8',
  ink: '#26231d', // main text (11.8:1 on the page)
  ink2: '#4f483c', // secondary text (6.8:1 on the page)
};
export const DARK = {
  bg: '#121212',
  surface: '#262626',
  muted: '#1b1b1b',
  border: '#525252',
  ink: '#ffffff',
  ink2: '#9e9e9e',
};
