import { type LoaderFunctionArgs, type LinksFunction } from '@remix-run/node';
import {
  Links,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { Layout as AntLayout } from 'antd';
import { type PropsWithChildren } from 'react';

import { RootErrorBoundary } from './components/error/root-error-boundary.tsx';
import { MenuDrawer } from './components/header/menu-drawer.tsx';
import { MobileNavbar } from './components/mobile-navbar/mobile-navbar.tsx';
import { PullToRefresh } from './components/pull-to-refresh/pull-to-refresh.tsx';
import { PWAOverlay } from './components/pwa/pwa-overlay.tsx';
import { config } from './config/config.server.ts';
import { getAppleTouchIconPath, getFaviconPath } from './config/meta.ts';
import { getPrivyUser } from './middleware.server/get-privy-user.ts';
import { Providers } from './providers/providers.tsx';
import { getEthToUsdRate } from './services.server/echo.ts';
import styles from './tailwind.css?url';
import { ClientHintCheck, getHints } from './theme/client-hints.tsx';
import { getTheme } from './theme/theme.server.ts';
import { useThemeMode } from './theme/utils.ts';
import theme from './theme.css?url';
import { generateOgMetadata, getDefaultImageUrl } from './utils/og.utils.ts';
import { ANTD_SSR_STYLE_PLACEHOLDER_TOKEN } from './utils/style.ts';
import { AppHeader } from '~/components/header/app-header.component.tsx';

// eslint-disable-next-line func-style
export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'stylesheet', href: styles },
  {
    rel: 'stylesheet',
    precedence: 'high',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans&display=swap',
  },
  {
    rel: 'stylesheet',
    href: theme,
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    as: 'image',
    href: '/assets/layout-background-dark.svg',
  },
  {
    rel: 'manifest',
    href: '/manifest.webmanifest',
  },
];

export type RootLoaderData = Awaited<ReturnType<typeof loader>>;
export async function loader({ request }: LoaderFunctionArgs) {
  const [theme, ethToUsdRate, privyUser] = await Promise.all([
    getTheme(request),
    getEthToUsdRate(),
    getPrivyUser(request),
  ]);

  return {
    privyAppId: config.EMPOROS_PRIVY_APP_ID,
    environment: config.ETHOS_ENV,
    requestInfo: {
      hints: getHints(request),
      userPrefs: {
        theme,
      },
    },
    ethToUsdRate,
    privyUser,
  };
}

// eslint-disable-next-line func-style
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const environment = data?.environment;

  if (!environment) return [];

  return [
    ...generateOgMetadata({
      title: 'Ethos Markets',
      description:
        'Trade trust on the first ever Reputation Market. InfoFi for reputation, by Ethos.',
      image: getDefaultImageUrl(environment),
    }),
    {
      tagName: 'link',
      rel: 'apple-touch-icon',
      href: getAppleTouchIconPath(environment, '180x180'),
      sizes: '180x180',
    },
    {
      tagName: 'link',
      rel: 'apple-touch-icon',
      href: getAppleTouchIconPath(environment, '57x57'),
      sizes: '57x57',
    },
    {
      tagName: 'link',
      rel: 'icon',
      type: 'image/svg+xml',
      href: getFaviconPath(environment, 'svg'),
    },
    {
      tagName: 'link',
      rel: 'icon',
      type: 'image/x-icon',
      href: getFaviconPath(environment, 'ico'),
    },
    {
      name: 'theme-color',
      content: '#232320',
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'Ethos.markets',
    },
    {
      name: 'application-name',
      content: 'Ethos.markets',
    },
  ];
};

export function Layout({ children }: PropsWithChildren) {
  const mode = useThemeMode();

  return (
    <html lang="en" className={mode === 'dark' ? 'dark' : ''}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ClientHintCheck />
        <Meta />
        <Links />
        {/* Placeholder for Ant Design SSR-generated styles */}
        {typeof document === 'undefined' ? ANTD_SSR_STYLE_PLACEHOLDER_TOKEN : null}
      </head>
      <body className="bg-antd-colorBgBase h-full pb-safe">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { privyAppId, environment, requestInfo } = useLoaderData<typeof loader>();
  const theme = requestInfo.userPrefs.theme ?? requestInfo.hints.theme;

  return (
    <Providers environment={environment} privyAppId={privyAppId} theme={theme}>
      <AntLayout className='h-full min-h-dvh bg-[url("/assets/layout-background.svg")] dark:bg-[url("/assets/layout-background-dark.svg")] bg-no-repeat bg-fixed bg-[right_293px]'>
        <PullToRefresh>
          <AppHeader />
          <AntLayout.Content className="flex justify-center w-full md:w-11/12 lg:w-5/6 xl:w-3/4 xl:max-w-screen-xl md:mx-auto lg:px-8 px-4 mb-32">
            <Outlet />
          </AntLayout.Content>
          <PWAOverlay />
        </PullToRefresh>
        <MenuDrawer />
        <MobileNavbar />
      </AntLayout>
    </Providers>
  );
}

export const ErrorBoundary = RootErrorBoundary;
