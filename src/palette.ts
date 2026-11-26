/**
 * The site's page colours, in one place. Light mode is plain white with neutral greys; dark mode is near-black.
 * Used by: the Astryx theme (src/theme.ts), the <html> background and the --bg/--fg variables (App.tsx),
 * and the theme-change flood (src/theme-rain/engine.ts), which must match the page exactly or it would flash.
 */
export const LIGHT = {
  bg: '#ffffff', // the page
  surface: '#f5f5f5', // cards, raised surfaces
  muted: '#ebebeb', // chips, subtle fills
  border: '#d4d4d4',
  ink: '#000000', // main text (21:1 on the page)
  ink2: '#3d3d3d', // secondary text (11.2:1 on the page)
};
export const DARK = {
  bg: '#121212',
  surface: '#262626',
  muted: '#1b1b1b',
  border: '#525252',
  ink: '#ffffff',
  ink2: '#9e9e9e',
};
