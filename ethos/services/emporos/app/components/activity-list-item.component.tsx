import { formatEth } from '@ethos/helpers';
import { Link } from '@remix-run/react';
import { Flex, List, Skeleton, Typography } from 'antd';
import clsx from 'clsx';
import { MarketAvatar } from './avatar/market-avatar.component.tsx';
import { MarketUserAvatar } from './avatar/user-avatar.component.tsx';
import { ThumbsDownFilledIcon, ThumbsUpFilledIcon } from './icons/thumbs.tsx';
import { RelativeDateTime } from './relative-time.component.tsx';
import { TransactionIcon } from './transact-form/tx-icon.tsx';
import { type MarketActivity } from '~/types/activity.ts';

type MarketActivityCardProps = {
  activity: MarketActivity;
};

export function ActivityListItem({ activity }: MarketActivityCardProps) {
  const { user, market } = activity;

  return (
    <List.Item className="border-b border-borderSecondary list-none w-full">
      <Flex align="center" justify="left" gap={12} className="w-full">
        <Link to={`/market/${market.profileId}`}>
          <MarketAvatar avatarUrl={market.avatarUrl} size={48} />
        </Link>
        <Flex vertical justify="space-between" gap={4} className="grow">
          <Flex justify="space-between" gap={4} align="baseline">
            <Flex justify="start" align="baseline" gap={2}>
              <Typography.Text className="font-semibold text-antd-colorText">
                Do you trust {market.name}?
              </Typography.Text>
            </Flex>
            <Typography.Text type="secondary">
              <RelativeDateTime timestamp={activity.timestamp} verbose />{' '}
              <TransactionIcon hash={activity.txHash} />
            </Typography.Text>
          </Flex>
          <Typography.Text className="text-antd-colorTextSecondary">
            <span>
              <MarketUserAvatar
                avatarUrl={user.avatarUrl}
                size={20}
                address={user.address}
                rootClassName="inline mr-1"
              />
            </span>
            <Link to={`/profile/${activity.user.address}`} className="text-antd-colorTextSecondary">
              {activity.user.username}{' '}
            </Link>
            <span>{activity.type === 'BUY' ? 'bought' : 'sold'}</span>{' '}
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
            <span>{` votes ${formatEth(activity.priceWei)}`}</span>
          </Typography.Text>
        </Flex>
      </Flex>
    </List.Item>
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

ActivityListItem.Skeleton = SkeletonActivityCard;
