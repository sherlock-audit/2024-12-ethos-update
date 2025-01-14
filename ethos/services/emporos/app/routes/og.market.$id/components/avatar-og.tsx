import { emporosUrlMap } from '@ethos/env';
import { type CSSProperties } from 'react';
import { config } from '~/config/config.server.ts';

// All og components will run on the server
const fallbackAvatar = new URL(
  '/assets/images/og/avatar-placeholder.svg',
  emporosUrlMap[config.ETHOS_ENV],
).toString();

export function AvatarOG({
  avatar,
  size,
  style,
  avatarStyle,
}: {
  avatar: string | undefined;
  size: string | number;
  style?: CSSProperties;
  avatarStyle?: CSSProperties;
}) {
  return (
    <div tw="flex" style={{ width: size, height: size, ...style }}>
      <div tw="flex rounded-[16px] overflow-hidden" style={{ ...avatarStyle }}>
        {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
        <img src={avatar || fallbackAvatar} tw="w-full h-full" />
      </div>
    </div>
  );
}
