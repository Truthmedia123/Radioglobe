export const COLORS = {
  primary: '#F5A623', // Warm Signal Amber
  background: '#0B0E14', // Deep Receiving Black
  surface: '#1A1F2E', // Midnight Station Blue
  error: '#E34A4A', // Dial Red
  record: '#4ECDC4', // Teal
  secondaryText: '#C0C5CE', // Moonlight Silver
  text: '#FFFFFF', // Assuming white for primary text
};

export const FONTS = {
  primary: 'Inter',
  headline: 'Playfair Display', // or DM Serif Display
  mono: 'JetBrains Mono',
};

export const TYPOGRAPHY = {
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
  }
};
