'use client';

import { useMemo, useEffect, useState } from 'react';

export interface SchoolColors {
  primary: string;
  secondary: string;
}

/**
 * Hook to get school colors from CSS variables set by SchoolThemeProvider
 * Falls back to default blue colors if not set
 */
export function useSchoolColors(): SchoolColors {
  const [colors, setColors] = useState<SchoolColors>({
    primary: '#3B82F6',
    secondary: '#1E40AF',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);

      // Try to get colors from CSS variables
      const primaryHex = style.getPropertyValue('--school-primary')?.trim();
      const secondaryHex = style.getPropertyValue('--school-secondary')?.trim();

      if (primaryHex && secondaryHex) {
        setColors({
          primary: primaryHex,
          secondary: secondaryHex,
        });
      } else {
        // Fallback to HSL values
        const primaryHsl = style.getPropertyValue('--color-primary')?.trim();
        const secondaryHsl = style.getPropertyValue('--color-secondary')?.trim();

        if (primaryHsl && secondaryHsl) {
          // Convert HSL to Hex (simplified - assumes proper HSL format)
          const hslToHex = (hsl: string): string => {
            const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
            if (!match) return '#3B82F6';
            const [, h, s, l] = match;
            return `hsl(${h}, ${s}%, ${l}%)`;
          };

          setColors({
            primary: hslToHex(primaryHsl),
            secondary: hslToHex(secondaryHsl),
          });
        }
      }
    }
  }, []);

  return colors;
}

/**
 * Hook to get school colors as HSL strings for use in Tailwind classes
 * Returns an object with primary and secondary HSL values
 */
export function useSchoolColorsHsl() {
  const colors = useSchoolColors();

  // Convert hex to HSL
  const hexToHsl = (hex: string): string => {
    let hexValue = hex.replace('#', '');

    if (hexValue.length === 3) {
      hexValue = hexValue.split('').map((char) => char + char).join('');
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

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return {
    primary: hexToHsl(colors.primary),
    secondary: hexToHsl(colors.secondary),
  };
}
