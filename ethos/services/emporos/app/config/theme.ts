import { getDarkTheme, getLightTheme, tokenCssVarsBase } from '@ethos/common-ui';
import { type ThemeConfig } from 'antd';
import { type AliasToken } from 'antd/es/theme/internal';

const baseDarkTheme = getDarkTheme('Inter, sans-serif');
const baseLightTheme = getLightTheme('Inter, sans-serif');

type CustomToken = Partial<AliasToken> & {
  colorTrust: string;
  colorTrustBg: string;
  colorDistrust: string;
  colorDistrustBg: string;
};

export const tokenCssVars = tokenCssVarsBase;

const sharedToken = {
  fontSize: 14,
  fontSizeLG: 16,
  // Target: 22px for fontSize 14
  lineHeight: 1.571,
} as const satisfies Partial<AliasToken>;

export const darkToken = {
  ...baseDarkTheme.token,
  ...sharedToken,
  colorTrust: '#2e7bc3',
  colorTrustBg: '#2d3d48',
  colorDistrust: '#b72b38',
  colorDistrustBg: '#4a3227',
  colorPrimary: '#C1C0B6',
  colorPrimaryBgHover: '#C1C0B61A',
  colorPrimaryBg: '#C1C0B61A',
} as const satisfies CustomToken;

export const lightToken = {
  ...baseLightTheme.token,
  ...sharedToken,
  colorTrust: '#1f21b6',
  colorTrustBg: '#a9a9c0',
  colorDistrust: '#b72b38',
  colorDistrustBg: '#c6b0a3',
  colorPrimary: '#1F2126',
  colorPrimaryBgHover: '#1F21B614',
  colorPrimaryBg: '#1F21B61A',
} as const satisfies CustomToken;

export const darkTheme = {
  ...baseDarkTheme,
  cssVar: { key: 'antd-dark' },
  // If there is only one version of antd in your application, you can set `false` to reduce the bundle size
  hashed: false,
  token: darkToken,
  components: {
    ...baseDarkTheme.components,
    Button: {
      ...baseDarkTheme.components.Button,
      defaultBg: baseDarkTheme.token.colorBgBase,
      defaultHoverBg: baseDarkTheme.token.colorBgElevated,
      defaultHoverBorderColor: baseDarkTheme.token.colorBgBase,
    },
    Anchor: {
      ...baseDarkTheme.components.Anchor,
      fontSize: 14,
      fontSizeLG: 16,
      lineHeightLG: 1.5,
    },
    Alert: {
      ...baseDarkTheme.components.Alert,
      fontSize: 14,
    },
    Tooltip: {
      ...baseDarkTheme.components.Tooltip,
      fontSize: 14,
      lineHeight: 1.75,
    },
    Typography: {
      ...baseDarkTheme.components.Typography,
      fontSize: 14,
      lineHeight: 1.571,
      fontSizeLG: 16,
      lineHeightLG: 1.5,
    },
  },
} as const satisfies ThemeConfig;

export const lightTheme = {
  ...baseLightTheme,
  cssVar: { key: 'antd-light' },
  // If there is only one version of antd in your application, you can set `false` to reduce the bundle size
  hashed: false,
  token: lightToken,
  components: {
    ...baseLightTheme.components,
    Button: {
      ...baseLightTheme.components.Button,
      defaultBg: baseLightTheme.token.colorBgBase,
      defaultHoverBg: baseLightTheme.token.colorBgElevated,
      defaultHoverBorderColor: baseLightTheme.token.colorBgBase,
    },
    Anchor: {
      ...baseDarkTheme.components.Anchor,
      fontSize: 14,
      fontSizeLG: 16,
    },
    Alert: {
      ...baseDarkTheme.components.Alert,
      fontSize: 14,
    },
    Tooltip: {
      ...baseDarkTheme.components.Tooltip,
      fontSize: 14,
      lineHeight: 1.75,
    },
    Typography: {
      ...baseLightTheme.components.Typography,
      fontSize: 14,
      fontSizeLG: 16,
    },
  },
} as const satisfies ThemeConfig;
