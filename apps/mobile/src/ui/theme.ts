import { tempoColors, tempoRadius, tempoSpacing } from '@tempo/ui';

/**
 * Dark biometric theme for TempoBEAST's command-center surfaces.
 *
 * Extends the shared `@tempo/ui` "Surreal Performance OS" tokens with the
 * near-black canvas, graphite cards, and the recovery-green accent the shared
 * palette did not yet have. Original TempoBEAST design language — not copied
 * from any third-party product.
 */
export const biometricTheme = {
  colors: {
    // Surfaces — near-black canvas, graphite cards, charcoal elevation.
    background: '#08090C',
    backgroundSoft: '#0C0E12',
    card: '#12151B',
    cardElevated: '#191D25',
    glass: 'rgba(255,255,255,0.04)',
    line: 'rgba(255,255,255,0.07)',
    lineStrong: 'rgba(255,255,255,0.14)',

    // Text — high-contrast white numerics, muted gray labels.
    textPrimary: '#FFFFFF',
    textSecondary: '#9AA3B2',
    textMuted: '#5C6473',

    // Accents — semantic, neon-on-dark.
    strain: tempoColors.tempoBlue, // blue: strain / focus
    strainBright: tempoColors.electricCyan, // cyan
    recovery: '#2FE6A4', // green: recovery / readiness
    recoverySoft: 'rgba(47,230,164,0.16)',
    caution: tempoColors.amber, // amber/yellow: caution / load
    cautionWarm: tempoColors.neonCoral, // orange
    health: tempoColors.recoveryViolet, // purple: health-signal traces
    healthBright: '#A78BFA',
    danger: tempoColors.hotCoral, // red: serious warning states only
    white: tempoColors.white,
  },
  spacing: tempoSpacing,
  radius: tempoRadius,
  typography: {
    hero: 56,
    score: 40,
    title: 26,
    heading: 20,
    body: 15,
    label: 12,
    micro: 10,
  },
  // Soft, premium card shadow (iOS) — Android uses elevation in components.
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
} as const;

export type BiometricTheme = typeof biometricTheme;
export type AccentColor = BiometricTheme['colors'][keyof BiometricTheme['colors']];
