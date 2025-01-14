import { css } from '@emotion/react';

export const TABLET_BREAKPOINT = 768;
export const DESKTOP_BREAKPOINT = 1024;

export const hideOnMobileCSS = css`
  @media (max-width: ${TABLET_BREAKPOINT - 1}px) {
    display: none;
  }
`;

export const hideOnBelowTabletCSS = css`
  @media (max-width: ${TABLET_BREAKPOINT - 1}px) {
    display: none;
  }
`;

export const hideOnTabletOnlyCSS = css`
  @media (min-width: ${TABLET_BREAKPOINT}px) and (max-width: ${DESKTOP_BREAKPOINT - 1}px) {
    display: none;
  }
`;

export const displayOnTabletOnlyCSS = css`
  display: none;
  @media (min-width: ${TABLET_BREAKPOINT}px) and (max-width: ${DESKTOP_BREAKPOINT - 1}px) {
    display: initial;
  }
`;

export const hideOnTabletAndAboveCSS = css`
  @media (min-width: ${TABLET_BREAKPOINT}px) {
    display: none;
  }
`;

export const hideOnBelowDesktopCSS = css`
  @media (max-width: ${DESKTOP_BREAKPOINT - 1}px) {
    display: none;
  }
`;

export const hideOnDesktopCSS = css`
  @media (min-width: ${DESKTOP_BREAKPOINT}px) {
    display: none;
  }
`;
