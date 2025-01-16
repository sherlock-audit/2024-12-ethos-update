import { formatEth, pluralize } from '@ethos/helpers';
import { Flex, Skeleton, Typography } from 'antd';
import clsx from 'clsx';
import { MarketUserAvatar } from './avatar/user-avatar.component.tsx';
import { ThumbsDownFilledIcon, ThumbsUpFilledIcon } from './icons/thumbs.tsx';
import { RelativeDateTime } from './relative-time.component.tsx';
import { TransactionIcon } from './transact-form/tx-icon.tsx';
import { useWeiToUSD } from '~/hooks/eth-price.tsx';
import { type MarketActivity } from '~/types/activity.ts';

type MarketActivityCardProps = {
  activity: MarketActivity;
};

export function ActivityCard({ activity }: MarketActivityCardProps) {
  const { user } = activity;
  const priceInUSD = useWeiToUSD(activity.priceWei, 0);

  return (
    /* I am removing the link here for now since we don't need it and may not ever
     <Link to={`/market/activity/${activity.eventId}`} className="relative"> */
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
        <Flex justify="space-between" gap={4} align="baseline">
          <Flex justify="start" align="baseline" gap={2}>
            <Typography.Text className="text-sm font-semibold ">{user.username}</Typography.Text>
          </Flex>
          <Typography.Text>
            <RelativeDateTime timestamp={activity.timestamp} verbose />{' '}
            <TransactionIcon hash={activity.txHash} />
          </Typography.Text>
        </Flex>
        <Typography.Text className="text-antd-colorTextSecondary leading-none">
          <span>{activity.type === 'BUY' ? 'Bought' : 'Sold'}</span>{' '}
          <span
            className={clsx(
              'font-semibold',
              { 'text-trust': activity.voteType === 'trust' },
              { 'text-distrust': activity.voteType === 'distrust' },
            )}
          >
            {activity.voteType === 'trust' ? <ThumbsUpFilledIcon /> : <ThumbsDownFilledIcon />}
            {` ${activity.votes} `}
            {activity.voteType}
          </span>
          <span className="hidden sm:inline">
            {' '}
            {pluralize(Number(activity.votes), 'vote', 'votes')}
          </span>
          <span>{` for `}</span>
          <span className="font-semibold">{formatEth(activity.priceWei)}</span>
          {priceInUSD ? ` (${priceInUSD})` : null}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

function SkeletonActivityCard() {
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
          <Flex justify="start" align="baseline" gap={2}>
            <Skeleton paragraph={false} />
          </Flex>
          <Skeleton paragraph={false} />
        </Flex>
        <Skeleton paragraph={false} />
      </Flex>
    </Flex>
  );
}

ActivityCard.Skeleton = SkeletonActivityCard;
