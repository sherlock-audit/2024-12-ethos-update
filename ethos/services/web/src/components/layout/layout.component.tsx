'use client';
import { css } from '@emotion/react';
import { Layout, theme } from 'antd';
import { useEffect } from 'react';
import { useCheckPendingInvitations } from '../auth/useCheckPendingInvitations';
import { Navigation } from '../header/header.component';
import { HeaderAnnouncements } from '../header-announcements/header-announcements.component';
import { PWAModal } from '../pwa-modal/pwa-modal.component';
import { SmartWalletNotConnectedAlert } from './alerts/smart-wallet-alert.component';
import { MobileNavbar } from 'components/mobile-navbar/mobile-navbar';
import { tokenCssVars } from 'config/theme';
import {
  HEADER_HEIGHT,
  MAIN_LAYOUT_PADDING_BOTTOM,
  MAIN_LAYOUT_PADDING_BOTTOM_MOBILE,
} from 'constant/constants';
import { useThemeMode } from 'contexts/theme-manager.context';

const { useToken } = theme;
const { Content } = Layout;

export function MainLayout({ children }: React.PropsWithChildren) {
  const { token } = useToken();
  const mode = useThemeMode();
  useCheckPendingInvitations();
  const layoutBackground = `/assets/images/layout-background${mode === 'dark' ? '-dark' : ''}.svg`;

  useEffect(() => {
    if (window !== undefined && token.Layout?.bodyBg) {
      document.body.style.backgroundColor = token.Layout.bodyBg;
    }
  }, [token.Layout?.bodyBg]);

  return (
    <Layout
      css={css`
        @media (max-width: ${token.screenLG}px) {
          .ant-layout-header {
            padding: 0px 20px;
          }
        }
      `}
    >
      <HeaderAnnouncements />
      <Navigation />
      <Content
        css={css`
          padding-bottom: ${MAIN_LAYOUT_PADDING_BOTTOM}px;
          min-height: calc(${tokenCssVars.fullHeight} - ${HEADER_HEIGHT}px);
          z-index: 5;
          background-image: url(${layoutBackground});
          background-repeat: no-repeat;
          background-attachment: fixed;
          background-position: right 293px;
          position: relative;
          @media (max-width: ${token.screenMD - 1}px) {
            padding-bottom: calc(
              ${MAIN_LAYOUT_PADDING_BOTTOM_MOBILE}px + env(safe-area-inset-bottom)
            );
          }
        `}
      >
        <Content
          css={css`
            max-width: 1200px;
            padding-left: 12px;
            padding-right: 12px;
            margin: 0 auto !important;
          `}
        >
          <SmartWalletNotConnectedAlert />
          {children}
        </Content>
        <MobileNavbar />
      </Content>
      <PWAModal />
    </Layout>
  );
}
