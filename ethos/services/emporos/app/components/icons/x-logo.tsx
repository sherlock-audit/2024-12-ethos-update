import Icon, { type CustomIconComponentProps } from './icon.tsx';
import { useThemeToken } from '~/theme/utils.ts';

export function XLogoSvg({ fillColor, xColor }: { fillColor: string; xColor: string }) {
  return (
    <svg width="1em" height="1em" fill="none" viewBox="0 0 32 32">
      <rect width="1em" height="1em" fill={fillColor} rx="4" />
      <path
        fill={xColor}
        d="m17.793 14.585 6.959-7.92h-1.649l-6.045 6.876-4.824-6.877H6.668l7.297 10.4-7.297 8.305h1.648l6.38-7.263 5.096 7.263h5.566M8.91 7.881h2.533l11.658 16.33h-2.533"
      />
    </svg>
  );
}

export function XLogo(props: Partial<CustomIconComponentProps>) {
  const themeToken = useThemeToken();

  return (
    <Icon
      component={() => (
        <XLogoSvg fillColor={themeToken.colorBgBase} xColor={themeToken.colorTextTertiary} />
      )}
      {...props}
    />
  );
}
