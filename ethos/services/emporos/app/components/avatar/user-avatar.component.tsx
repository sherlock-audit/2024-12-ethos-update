import { Link } from '@remix-run/react';
import { Avatar } from 'antd';
import { type Address } from 'viem';
import { PersonIcon } from '../icons/person.tsx';
import { EthosLogoIcon } from '~/components/icons/ethos-logo.tsx';
import { cn } from '~/utils/cn.ts';
import { getTextColorClassFromScore } from '~/utils/score.utils.ts';

type AvatarProps = {
  avatarUrl: string | undefined | null;
  address: Address | string;
  size?: 'default' | 'small' | 'xs' | 'xxs' | number;
  scoreSize?: 'default' | 'small' | 'xs' | 'xxs' | number;
  rootClassName?: string;
  ethosScore?: number | null;
  showLink?: boolean;
};

export const AVATAR_SIZES: Record<NonNullable<AvatarProps['size']>, number> = {
  xxs: 30,
  xs: 40,
  small: 64,
  default: 80,
};

export function MarketUserAvatar({
  avatarUrl,
  ethosScore,
  size = 'default',
  scoreSize,
  rootClassName,
  address,
  showLink = true,
}: AvatarProps) {
  const content = (
    <div className={cn('relative', rootClassName)}>
      <Avatar
        src={avatarUrl}
        size={typeof size === 'number' ? size : AVATAR_SIZES[size]}
        icon={<PersonIcon />}
      />
      <ScoreBadge
        score={ethosScore ?? 0}
        className="absolute bottom-[0] left-1/2 -translate-x-1/2 translate-y-[4px]"
        size={scoreSize ?? size}
      />
    </div>
  );

  return showLink ? <Link to={`/profile/${address}`}>{content}</Link> : content;
}

export function ScoreBadge({
  score,
  className,
  size = 'default',
}: {
  score: number;
  className?: string;
  size?: AvatarProps['size'];
}) {
  if (score <= 0) {
    return null;
  }

  const avatarSize = typeof size === 'number' ? size : AVATAR_SIZES[size];

  return (
    <span
      className={cn(
        'bg-antd-colorBgBase flex items-center gap-1 px-2 text-center border-solid border-2 border-antd-colorBgContainer rounded-full font-thin',
        {
          'text-[8px] px-1.5': avatarSize <= AVATAR_SIZES.xxs, // size <= 30
          'text-[10px] px-1.5': avatarSize > AVATAR_SIZES.xxs && avatarSize <= AVATAR_SIZES.xs, // size > 30 && size <= 40
          'text-xs': avatarSize > AVATAR_SIZES.xs, // size > 40
        },
        className,
      )}
    >
      {score}
      <EthosLogoIcon
        className={cn(getTextColorClassFromScore(score ?? 0), { 'text-[8px]': size === 'xs' })}
      />
    </span>
  );
}
