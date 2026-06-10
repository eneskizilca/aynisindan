export const theme = {
  colors: {
    primary: '#de6b48',       // Orange brand color
    primaryLight: '#fff1ed',  // Light orange background for icons/badges
    background: '#fff8f6',    // Warm off-white background
    card: '#ffffff',          // Card/Form background
    textDark: '#231916',      // Dark brown/black for headings
    textMuted: '#56423d',     // Muted brown for subheadings/descriptions
    textSecondary: '#8a726b', // Soft brown for icons/placeholders
    border: '#e9d6d1',        // Soft border line color
    borderActive: '#de6b48',  // Border color when input is active
    error: '#dc2626',         // Red error color
    errorBg: '#fef2f2',       // Red error background
    success: '#16a34a',       // Green success color
    successBg: '#f0fdf4',     // Green success background
    overlay: 'rgba(35, 25, 22, 0.4)', // Overlay color for modals
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 9999,
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    fontWeights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
};

export type Theme = typeof theme;
