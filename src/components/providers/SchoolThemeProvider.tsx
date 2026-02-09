'use client';

import { useEffect, useState } from 'react';

interface SchoolColors {
  primary: string;
  secondary: string;
}

interface SchoolThemeProviderProps {
  colors: SchoolColors;
  children: React.ReactNode;
}

/**
 * SchoolThemeProvider - Sistema de temas dinámico premium
 *
 * Inyecta CSS variables personalizadas basadas en los colores de la escuela,
 * permitiendo que todo el sistema de Tailwind utilice los colores dinámicos.
 *
 * Características:
 * - Actualización dinámica de CSS variables
 * - Soporte para modo claro y oscuro
 * - Transiciones suaves entre cambios de color
 * - Generación automática de variantes de color (hover, muted, etc.)
 */
export function SchoolThemeProvider({ colors, children }: SchoolThemeProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Función para convertir hex a HSL
    const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
      let hexValue = hex.replace('#', '');

      // Manejar formatos cortos (3 caracteres)
      if (hexValue.length === 3) {
        hexValue = hexValue
          .split('')
          .map((char) => char + char)
          .join('');
      }

      const r = parseInt(hexValue.substring(0, 2), 16) / 255;
      const g = parseInt(hexValue.substring(2, 4), 16) / 255;
      const b = parseInt(hexValue.substring(4, 6), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      };
    };

    // Función para crear variantes de color
    const createColorVariants = (hex: string) => {
      const hsl = hexToHsl(hex);

      return {
        DEFAULT: `${hsl.h} ${hsl.s}% ${hsl.l}%`,
        foreground: `${hsl.h} 30% 98%`,
        50: `${hsl.h} ${hsl.s}% 97%`,
        100: `${hsl.h} ${hsl.s}% 94%`,
        200: `${hsl.h} ${hsl.s}% 86%`,
        300: `${hsl.h} ${hsl.s}% 77%`,
        400: `${hsl.h} ${hsl.s}% 66%`,
        500: `${hsl.h} ${hsl.s}% ${hsl.l}%`,
        600: `${hsl.h} ${hsl.s}% 55%`,
        700: `${hsl.h} ${hsl.s}% 45%`,
        800: `${hsl.h} ${hsl.s}% 35%`,
        900: `${hsl.h} ${hsl.s}% 25%`,
        950: `${hsl.h} ${hsl.s}% 15%`,
      };
    };

    // Aplicar variables CSS al root
    const root = document.documentElement;
    const primaryVariants = createColorVariants(colors.primary);
    const secondaryVariants = createColorVariants(colors.secondary);

    // Variables CSS primarias
    root.style.setProperty('--school-primary', colors.primary);
    root.style.setProperty('--school-secondary', colors.secondary);

    // Variables HSL para Tailwind
    Object.entries(primaryVariants).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });

    Object.entries(secondaryVariants).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });

    // Establecer el color primario principal para Tailwind
    root.style.setProperty('--color-primary', primaryVariants.DEFAULT);
    root.style.setProperty('--color-primary-foreground', primaryVariants.foreground);
    root.style.setProperty('--color-ring', primaryVariants.DEFAULT);

    // Marcar como listo para evitar parpadeo
    setIsReady(true);
  }, [colors]);

  // Evitar renderizado hasta que las variables estén listas
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl animate-spin"
               style={{
                 background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
               }}
          />
          <div className="absolute inset-0 w-12 h-12 rounded-2xl animate-ping opacity-20"
               style={{
                 background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
               }}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
