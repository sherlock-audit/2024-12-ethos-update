import { css, type SerializedStyles } from '@emotion/react';
import { type PropsWithChildren } from 'react';

export function ConnectButtonWrapper({
  children,
  ready,
  wrapperCSS,
}: PropsWithChildren<{
  ready: boolean;
  wrapperCSS?: SerializedStyles;
}>) {
  return (
    <div
      css={css(
        {
          lineHeight: 0,
        },
        wrapperCSS,
        !ready && {
          pointerEvents: 'none',
          userSelect: 'none',
        },
      )}
    >
      {children}
    </div>
  );
}
