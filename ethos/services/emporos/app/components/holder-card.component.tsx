import { pluralize, toNumber } from '@ethos/helpers';
import { Flex, Progress, Skeleton, Tooltip, Typography } from 'antd';
import clsx from 'clsx';
import { MarketUserAvatar } from './avatar/user-avatar.component.tsx';
import { ThumbsDownFilledIcon, ThumbsUpFilledIcon } from './icons/thumbs.tsx';
import { type useRouteMarketInfo } from '~/hooks/market.tsx';
import { useThemeToken } from '~/theme/utils.ts';
import { type MarketHoldersInfo } from '~/types/markets.ts';

export function HolderCard({
  holder,
  market,
}: {
  holder: MarketHoldersInfo;
  market: Awaited<ReturnType<typeof useRouteMarketInfo>>;
}) {
  const themeToken = useThemeToken();
  let votePercentage = 0;
  const { user } = holder;

  if (holder.voteType === 'trust') {
    votePercentage =
      market.stats.trustVotes === 0 ? 0 : Number(holder.total) / Number(market.stats.trustVotes);
  } else if (market && holder.voteType === 'distrust') {
    votePercentage =
      market.stats.distrustVotes === 0
        ? 0
        : Number(holder.total) / Number(market.stats.distrustVotes);
  }

  const percentage = toNumber(Number(votePercentage * 100));

  return (
    <Flex
      align="center"
      justify="left"
      gap={12}
      className="bg-antd-colorBgContainer rounded-lg py-3 px-4"
    >
      <MarketUserAvatar
        avatarUrl={user.avatarUrl}
        size="xs"
        ethosScore={user.ethosInfo.score}
        address={user.address}
      />
      <Flex vertical justify="space-between" gap={4} className="grow">
        <Typography.Text className="text-sm font-semibold">{user.name}</Typography.Text>
        <Typography.Text className="flex items-center gap-1 leading-none">
          <span
            className={clsx({
              'text-trust': holder.voteType === 'trust',
              'text-distrust': holder.voteType === 'distrust',
              'font-semibold': true,
            })}
          >
            {holder.voteType === 'trust' ? <ThumbsUpFilledIcon /> : <ThumbsDownFilledIcon />}{' '}
            {holder.total.toString()} {holder.voteType}
          </span>
          <span>{pluralize(Number(holder.total), 'vote', 'votes')}</span>
        </Typography.Text>
      </Flex>
      <Tooltip title={`${formatPercentage(percentage)} of ${holder.voteType} votes owned`}>
        <Progress
          size={50}
          type="circle"
          strokeColor={
            holder.voteType === 'trust' ? themeToken.colorTrust : themeToken.colorDistrust
          }
          percent={percentage}
          format={(percent) => formatPercentage(percent, true)}
          className="ml-auto"
        />
      </Tooltip>
    </Flex>
  );
}

function SkeletonHolderCard() {
  return (
    <Flex
      align="center"
      justify="left"
      gap={6}
      className="bg-antd-colorBgContainer rounded-lg py-3 px-4"
    >
      <Skeleton.Avatar size={40} />
      <Flex vertical justify="space-between" gap={4} className="grow">
        <Flex justify="space-between" gap={4} align="baseline">
          <Skeleton paragraph={false} />
          <Skeleton.Avatar size={18} />
        </Flex>
        <Skeleton paragraph={false} />
      </Flex>
    </Flex>
  );
}

HolderCard.Skeleton = SkeletonHolderCard;

function formatPercentage(percent: number | undefined, isCompact: boolean = false): string {
  if (!percent) {
    return '0%';
  }

  if (percent < 0.1 && isCompact) {
    return `<1%`;
  }
  if (percent < 0.01) {
    return `<${percent.toFixed(3)}%`;
  }
  if (percent < 0.1) {
    return `<${percent.toFixed(2)}%`;
  }

  if (percent < 1) {
    return `${percent.toFixed(1)}%`;
  }

  // parse float to remove trailing 0s such as 5.0%
  return `${parseFloat(percent.toFixed(isCompact ? 0 : 1))}%`;
}
