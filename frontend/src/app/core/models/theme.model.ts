/**
 * Modelos de configuração de temas
 * Inspirado no Sakai-NG: https://github.com/primefaces/sakai-ng
 */

/**
 * Configuração de cores do tema
 */
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  surface: string;
  surfaceLight: string;
  surfaceDark: string;
}

/**
 * Configuração completa do tema
 */
export interface ThemeConfig {
  name: string;
  dark: boolean;
  colors: ThemeColors;
}

/**
 * Temas pré-definidos
 */
export const THEMES: Record<string, ThemeConfig> = {
  // Tema Light padrão (Indigo)
  light: {
    name: 'Light',
    dark: false,
    colors: {
      primary: '#6366F1', // Indigo 500
      primaryLight: '#818CF8', // Indigo 400
      primaryDark: '#4F46E5', // Indigo 600
      surface: '#FFFFFF',
      surfaceLight: '#F9FAFB',
      surfaceDark: '#F3F4F6',
    },
  },

  // Tema Dark padrão (Indigo)
  dark: {
    name: 'Dark',
    dark: true,
    colors: {
      primary: '#6366F1', // Indigo 500
      primaryLight: '#818CF8', // Indigo 400
      primaryDark: '#4F46E5', // Indigo 600
      surface: '#1E293B', // Slate 800
      surfaceLight: '#334155', // Slate 700
      surfaceDark: '#0F172A', // Slate 900
    },
  },

  // Tema Light - Purple
  lightPurple: {
    name: 'Light Purple',
    dark: false,
    colors: {
      primary: '#9333EA', // Purple 600
      primaryLight: '#A855F7', // Purple 500
      primaryDark: '#7E22CE', // Purple 700
      surface: '#FFFFFF',
      surfaceLight: '#F9FAFB',
      surfaceDark: '#F3F4F6',
    },
  },

  // Tema Dark - Purple
  darkPurple: {
    name: 'Dark Purple',
    dark: true,
    colors: {
      primary: '#9333EA',
      primaryLight: '#A855F7',
      primaryDark: '#7E22CE',
      surface: '#1E293B',
      surfaceLight: '#334155',
      surfaceDark: '#0F172A',
    },
  },

  // Tema Light - Blue
  lightBlue: {
    name: 'Light Blue',
    dark: false,
    colors: {
      primary: '#3B82F6', // Blue 500
      primaryLight: '#60A5FA', // Blue 400
      primaryDark: '#2563EB', // Blue 600
      surface: '#FFFFFF',
      surfaceLight: '#F9FAFB',
      surfaceDark: '#F3F4F6',
    },
  },

  // Tema Dark - Blue
  darkBlue: {
    name: 'Dark Blue',
    dark: true,
    colors: {
      primary: '#3B82F6',
      primaryLight: '#60A5FA',
      primaryDark: '#2563EB',
      surface: '#1E293B',
      surfaceLight: '#334155',
      surfaceDark: '#0F172A',
    },
  },

  // Tema Light - Green
  lightGreen: {
    name: 'Light Green',
    dark: false,
    colors: {
      primary: '#10B981', // Green 500
      primaryLight: '#34D399', // Green 400
      primaryDark: '#059669', // Green 600
      surface: '#FFFFFF',
      surfaceLight: '#F9FAFB',
      surfaceDark: '#F3F4F6',
    },
  },

  // Tema Dark - Green
  darkGreen: {
    name: 'Dark Green',
    dark: true,
    colors: {
      primary: '#10B981',
      primaryLight: '#34D399',
      primaryDark: '#059669',
      surface: '#1E293B',
      surfaceLight: '#334155',
      surfaceDark: '#0F172A',
    },
  },

  // Tema Light - Orange
  lightOrange: {
    name: 'Light Orange',
    dark: false,
    colors: {
      primary: '#F97316', // Orange 500
      primaryLight: '#FB923C', // Orange 400
      primaryDark: '#EA580C', // Orange 600
      surface: '#FFFFFF',
      surfaceLight: '#F9FAFB',
      surfaceDark: '#F3F4F6',
    },
  },

  // Tema Dark - Orange
  darkOrange: {
    name: 'Dark Orange',
    dark: true,
    colors: {
      primary: '#F97316',
      primaryLight: '#FB923C',
      primaryDark: '#EA580C',
      surface: '#1E293B',
      surfaceLight: '#334155',
      surfaceDark: '#0F172A',
    },
  },
};

/**
 * Opções de cores primárias disponíveis
 */
export const PRIMARY_COLORS = [
  { name: 'Indigo', value: '#6366F1', light: '#818CF8', dark: '#4F46E5' },
  { name: 'Purple', value: '#9333EA', light: '#A855F7', dark: '#7E22CE' },
  { name: 'Blue', value: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
  { name: 'Cyan', value: '#06B6D4', light: '#22D3EE', dark: '#0891B2' },
  { name: 'Teal', value: '#14B8A6', light: '#2DD4BF', dark: '#0D9488' },
  { name: 'Green', value: '#10B981', light: '#34D399', dark: '#059669' },
  { name: 'Lime', value: '#84CC16', light: '#A3E635', dark: '#65A30D' },
  { name: 'Yellow', value: '#EAB308', light: '#FACC15', dark: '#CA8A04' },
  { name: 'Orange', value: '#F97316', light: '#FB923C', dark: '#EA580C' },
  { name: 'Red', value: '#EF4444', light: '#F87171', dark: '#DC2626' },
  { name: 'Pink', value: '#EC4899', light: '#F472B6', dark: '#DB2777' },
  { name: 'Rose', value: '#F43F5E', light: '#FB7185', dark: '#E11D48' },
];
