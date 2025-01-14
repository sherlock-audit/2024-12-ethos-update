import { formatEth, pluralize } from '@ethos/helpers';
import { Button, Flex, Skeleton, Typography } from 'antd';
import clsx from 'clsx';
import { useTransactionForm } from './transaction-context.tsx';
import { InfoIcon } from '~/components/icons/info.tsx';
import { ThumbsDownFilledIcon, ThumbsUpFilledIcon } from '~/components/icons/thumbs.tsx';
import { useWeiToUSD } from '~/hooks/eth-price.tsx';
import { useMyVotes } from '~/hooks/market.tsx';
import { cn } from '~/utils/cn.ts';

export function OpenPositions() {
  const { state, setState } = useTransactionForm();
  const { data: positions } = useMyVotes(state.market.profileId);
  const { market } = state;

  function onSellClick(type: 'trust' | 'distrust', count: bigint) {
    setState({
      action: 'sell',
      voteType: type,
      sellAmount: Number(count),
      isTransactDrawerOpen: true,
    });
  }

  return (
    <Flex justify="left" gap={6} className="bg-antd-colorBgContainer rounded-lg py-3 px-4" vertical>
      <Flex align="center" gap={4} className="text-sm text-antd-colorTextHeading">
        <InfoIcon />
        <span>Open positions</span>
      </Flex>
      <Flex vertical className="w-full">
        {positions?.trustVotes ? (
          <PositionRow
            count={BigInt(positions.trustVotes)}
            type="trust"
            price={market.stats.trustPrice}
            onSellClick={onSellClick}
          />
        ) : (
          <SkeletonPositionCard />
        )}
        {positions?.distrustVotes ? (
          <PositionRow
            count={BigInt(positions.distrustVotes)}
            type="distrust"
            price={market.stats.distrustPrice}
            onSellClick={onSellClick}
          />
        ) : (
          <SkeletonPositionCard />
        )}
      </Flex>
    </Flex>
  );
}

function SkeletonPositionCard() {
  return (
    <Flex gap={12} justify="space-between" align="center" className="py-2">
      <Flex vertical className="flex-grow wrap">
        <Skeleton paragraph={false} />
      </Flex>
      <Skeleton.Button size="small" />
    </Flex>
  );
}

function PositionRow({
  count,
  type,
  price,
  onSellClick = () => {},
}: {
  count: bigint;
  type: 'trust' | 'distrust';
  price: bigint;
  onSellClick: (type: 'trust' | 'distrust', count: bigint) => void;
}) {
  const priceInUSD = useWeiToUSD(price * count, 0);

  if (count === 0n) {
    return null;
  }

  return (
    <Flex gap={12} justify="space-between" align="center" className="py-2">
      <Flex
        align="center"
        justify="center"
        className={cn('size-10 text-sm/none bg-antd-colorBgLayout rounded-4', {
          'text-trust': type === 'trust',
          'text-distrust': type === 'distrust',
        })}
      >
        {type === 'trust' ? <ThumbsUpFilledIcon /> : <ThumbsDownFilledIcon />}
      </Flex>
      <Flex vertical gap={2} className="flex-grow wrap">
        <Typography.Text>
          <span
            className={clsx('flex-shrink-0 font-bold', {
              'text-trust': type === 'trust',
              'text-distrust': type === 'distrust',
            })}
          >
            {count.toString()} {type}
          </span>{' '}
          {pluralize(Number(count), 'vote', 'votes')}
        </Typography.Text>
        <Typography.Text type="secondary" className="flex-grow wrap">
          Value:{' '}
          {formatEth(BigInt(price) * BigInt(count), 'wei', {
            minimumFractionDigits: 2,
          })}{' '}
          {priceInUSD ? `(${priceInUSD})` : null}
        </Typography.Text>
      </Flex>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => {
          onSellClick(type, count);
        }}
      >
        Sell
      </Button>
    </Flex>
  );
}
