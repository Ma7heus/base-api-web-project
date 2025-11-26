import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../../services/theme.service';
import { PRIMARY_COLORS } from '../../models/theme.model';

/**
 * Componente de Configuração de Tema
 *
 * Inspirado no Sakai-NG
 * Permite ao usuário personalizar:
 * - Modo claro/escuro
 * - Cor primária do tema
 *
 * Funcionalidades:
 * - Sidebar deslizante
 * - Preview de cores
 * - Persistência automática
 * - Feedback visual
 */
@Component({
  selector: 'app-theme-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DrawerModule,
    ToggleSwitch,
    TooltipModule,
  ],
  templateUrl: './theme-config.component.html',
  styleUrls: ['./theme-config.component.css'],
})
export class ThemeConfigComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly availableColors = PRIMARY_COLORS;

  protected visible = false;

  /**
   * Mostra o sidebar de configuração
   */
  show(): void {
    this.visible = true;
  }

  /**
   * Esconde o sidebar de configuração
   */
  hide(): void {
    this.visible = false;
  }

  /**
   * Alterna a visibilidade do sidebar
   */
  toggle(): void {
    this.visible = !this.visible;
  }

  /**
   * Seleciona uma cor primária
   */
  selectColor(colorHex: string): void {
    this.themeService.setPrimaryColor(colorHex);
  }

  /**
   * Verifica se uma cor está selecionada
   */
  isColorSelected(colorHex: string): boolean {
    return this.themeService.theme().colors.primary === colorHex;
  }

  /**
   * Alterna modo dark/light
   */
  toggleDarkMode(event: boolean): void {
    this.themeService.setDarkMode(event);
  }
}
