import { Injectable, signal, computed, effect } from '@angular/core';
import { ThemeConfig, THEMES, PRIMARY_COLORS } from '../models/theme.model';

/**
 * Serviço de Gerenciamento de Temas
 *
 * Inspirado no Sakai-NG: https://github.com/primefaces/sakai-ng
 *
 * Funcionalidades:
 * - Troca entre tema claro e escuro
 * - Personalização de cores primárias
 * - Persistência no localStorage
 * - Aplicação de variáveis CSS customizadas
 * - Suporte a temas pré-definidos
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme_config';

  // Estado reativo
  private readonly isDarkMode = signal<boolean>(false);
  private readonly currentTheme = signal<ThemeConfig>(THEMES['light']);

  // Computed signals públicos
  public readonly dark = this.isDarkMode.asReadonly();
  public readonly theme = this.currentTheme.asReadonly();
  public readonly themeName = computed(() => this.currentTheme().name);

  // Temas e cores disponíveis
  public readonly availableThemes = THEMES;
  public readonly availableColors = PRIMARY_COLORS;

  constructor() {
    // Carrega configuração salva
    this.loadSavedTheme();

    // Effect para aplicar tema automaticamente quando mudar
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  /**
   * Alterna entre modo claro e escuro
   */
  toggleDarkMode(): void {
    const newDarkMode = !this.isDarkMode();
    this.isDarkMode.set(newDarkMode);

    // Atualiza o tema mantendo as cores atuais
    const currentColors = this.currentTheme().colors;
    const newTheme = this.createThemeFromColors(currentColors.primary, newDarkMode);

    this.currentTheme.set(newTheme);
    this.saveTheme();
  }

  /**
   * Define o modo escuro
   */
  setDarkMode(dark: boolean): void {
    if (this.isDarkMode() !== dark) {
      this.toggleDarkMode();
    }
  }

  /**
   * Altera a cor primária do tema
   */
  setPrimaryColor(colorHex: string): void {
    const newTheme = this.createThemeFromColors(colorHex, this.isDarkMode());
    this.currentTheme.set(newTheme);
    this.saveTheme();
  }

  /**
   * Define um tema pré-configurado
   */
  setTheme(themeKey: string): void {
    const theme = THEMES[themeKey];
    if (theme) {
      this.currentTheme.set(theme);
      this.isDarkMode.set(theme.dark);
      this.saveTheme();
    }
  }

  /**
   * Cria um tema customizado a partir de uma cor primária
   */
  private createThemeFromColors(primaryColor: string, dark: boolean): ThemeConfig {
    // Encontra a configuração de cor correspondente
    const colorConfig = PRIMARY_COLORS.find((c) => c.value === primaryColor);

    return {
      name: dark ? 'Dark Custom' : 'Light Custom',
      dark,
      colors: {
        primary: primaryColor,
        primaryLight: colorConfig?.['light'] || this.lighten(primaryColor, 20),
        primaryDark: colorConfig?.['dark'] || this.darken(primaryColor, 20),
        surface: dark ? '#1E293B' : '#FFFFFF',
        surfaceLight: dark ? '#334155' : '#F9FAFB',
        surfaceDark: dark ? '#0F172A' : '#F3F4F6',
      },
    };
  }

  /**
   * Aplica o tema no documento
   */
  private applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;

    // Define variáveis CSS customizadas
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--primary-color-light', theme.colors.primaryLight);
    root.style.setProperty('--primary-color-dark', theme.colors.primaryDark);
    root.style.setProperty('--surface-color', theme.colors.surface);
    root.style.setProperty('--surface-color-light', theme.colors.surfaceLight);
    root.style.setProperty('--surface-color-dark', theme.colors.surfaceDark);

    // Cores de texto baseadas no modo
    if (theme.dark) {
      root.style.setProperty('--text-color', '#F1F5F9'); // Slate 100
      root.style.setProperty('--text-color-secondary', '#CBD5E1'); // Slate 300
      root.style.setProperty('--border-color', '#334155'); // Slate 700
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.style.setProperty('--text-color', '#1E293B'); // Slate 800
      root.style.setProperty('--text-color-secondary', '#64748B'); // Slate 500
      root.style.setProperty('--border-color', '#E2E8F0'); // Slate 200
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }

    // Atualiza body background
    document.body.style.backgroundColor = theme.dark
      ? theme.colors.surfaceDark
      : theme.colors.surfaceLight;
  }

  /**
   * Salva o tema no localStorage
   */
  private saveTheme(): void {
    const themeData = {
      theme: this.currentTheme(),
      darkMode: this.isDarkMode(),
    };
    localStorage.setItem(this.THEME_KEY, JSON.stringify(themeData));
  }

  /**
   * Carrega o tema salvo do localStorage
   */
  private loadSavedTheme(): void {
    try {
      const savedData = localStorage.getItem(this.THEME_KEY);

      if (savedData) {
        const { theme, darkMode } = JSON.parse(savedData);
        this.currentTheme.set(theme);
        this.isDarkMode.set(darkMode);
      } else {
        // Detecta preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkMode.set(prefersDark);
        this.currentTheme.set(prefersDark ? THEMES['dark'] : THEMES['light']);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      this.currentTheme.set(THEMES['light']);
      this.isDarkMode.set(false);
    }
  }

  /**
   * Clareia uma cor em hexadecimal
   */
  private lighten(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
        .toUpperCase()
    );
  }

  /**
   * Escurece uma cor em hexadecimal
   */
  private darken(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;

    return (
      '#' +
      (0x1000000 + (R > 0 ? R : 0) * 0x10000 + (G > 0 ? G : 0) * 0x100 + (B > 0 ? B : 0))
        .toString(16)
        .slice(1)
        .toUpperCase()
    );
  }
}
