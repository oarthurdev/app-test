
export const theme = {
  colors: {
    // Primary palette - Azul profissional moderno
    primary: '#2563eb',
    primaryDark: '#1e40af',
    primaryLight: '#3b82f6',
    
    // Secondary palette - Roxo elegante
    secondary: '#7c3aed',
    secondaryDark: '#6d28d9',
    secondaryLight: '#8b5cf6',
    
    // Accent colors
    accent: '#ec4899',
    accentDark: '#db2777',
    
    // Status colors
    success: '#10b981',
    successDark: '#059669',
    successLight: '#34d399',
    
    warning: '#f59e0b',
    warningDark: '#d97706',
    warningLight: '#fbbf24',
    
    error: '#ef4444',
    errorDark: '#dc2626',
    errorLight: '#f87171',
    
    info: '#06b6d4',
    infoDark: '#0891b2',
    infoLight: '#22d3ee',
    
    // Background colors - Design moderno
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: '#0f172a',
      card: '#ffffff',
    },
    
    // Text colors - Hierarquia clara
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8',
      inverse: '#ffffff',
      link: '#2563eb',
    },
    
    // Border colors
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#94a3b8',
    },
    
    // Gradients
    gradients: {
      primary: ['#2563eb', '#1e40af'],
      secondary: ['#7c3aed', '#6d28d9'],
      success: ['#10b981', '#059669'],
      sunset: ['#f59e0b', '#ec4899'],
      ocean: ['#06b6d4', '#2563eb'],
    },
    
    overlay: 'rgba(15, 23, 42, 0.6)',
  },
  
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  
  fontWeight: {
    light: '300' as '300',
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
    extrabold: '800' as '800',
  },
  
  shadows: {
    xs: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

export type Theme = typeof theme;
