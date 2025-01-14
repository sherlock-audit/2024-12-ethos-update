import { lightToken, isValidColor, isValidKey } from './utils.ts';

/**
 * Generates a mapping of Tailwind color names to CSS variables.
 * Example output: { antd-colorPrimary: var(--colorPrimary), antd-colorInfo: var(--colorInfo), ... }
 *
 * The CSS variables (--colorPrimary etc) are defined in public/theme.css
 * which is generated by generate-theme.ts
 *
 * These colors can be used in Tailwind classes like:
 * - bg-antd-colorPrimary
 * - text-antd-colorInfo
 * - border-antd-colorBorder
 */
export function generateTailwindColors() {
  const colors: Record<string, string> = {};
  // It does not matter if we use lightToken or darkToken here.
  // Because the list of colors is the same.
  Object.entries(lightToken).forEach(([key, value]) => {
    if (typeof value === 'string' && isValidColor(value) && isValidKey(key)) {
      colors[`antd-${key}`] = `var(--${key})`;
    }
  });

  return colors;
}