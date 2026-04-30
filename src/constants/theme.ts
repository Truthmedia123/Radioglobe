export const COLORS = {
  background: '#070A0F',
  backgroundSoft: '#0D121A',
  surface: '#141A24',
  surfaceElevated: '#1C2431',
  surfaceMuted: '#242D3B',
  primary: '#3DDC97',
  primarySoft: 'rgba(61, 220, 151, 0.16)',
  accent: '#7C6CFF',
  accentSoft: 'rgba(124, 108, 255, 0.18)',
  warning: '#FFB86B',
  record: '#FF6B6B',
  border: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  text: '#F7F9FC',
  secondaryText: '#A6B0C2',
  mutedText: '#697386',
  black: '#000000',
  white: '#FFFFFF',
  error: '#FF5D73',
};

export const FONTS = {
  primary: 'Inter',
  headline: 'Playfair Display',
  mono: 'JetBrains Mono',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  round: 999,
};

export const TYPOGRAPHY = {
  display: {
    fontFamily: FONTS.headline,
    fontSize: 38,
    color: COLORS.text,
  },
  h1: {
    fontFamily: FONTS.headline,
    fontSize: 32,
    color: COLORS.text,
  },
  h2: {
    fontFamily: FONTS.headline,
    fontSize: 24,
    color: COLORS.text,
  },
  h3: {
    fontFamily: FONTS.primary,
    fontSize: 18,
    color: COLORS.text,
  },
  body: {
    fontFamily: FONTS.primary,
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontFamily: FONTS.primary,
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  data: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.primary,
  },
};
