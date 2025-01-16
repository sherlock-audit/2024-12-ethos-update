import { formatCurrency, toNumber } from '@ethos/helpers';
import { AvatarOG } from './avatar-og.tsx';
import { MarketStatOG } from './market-stat-og.tsx';
import { SnapshotDateOG } from './snapshot-date-og.tsx';
import { VotePercentageOG } from './vote-percentage-og.tsx';
import { BarChartSvg } from '~/components/icons/bar-chart.tsx';
import { McapSvg } from '~/components/icons/mcap.tsx';
import { darkTheme } from '~/config/theme.ts';
import { type Market } from '~/types/markets.ts';

export function MarketCardOG({ market }: { market: Market }) {
  const trustPercentage = toNumber(market.trustPercentage.toFixed(0));

  return (
    <div
      tw="flex flex-col justify-between w-full h-full p-14 relative"
      style={{
        color: darkTheme.token.colorText,
        backgroundColor: darkTheme.token.colorBgLayout,
      }}
    >
      <SnapshotDateOG />
      <div tw="flex w-full items-center" style={{ gap: '36px' }}>
        <AvatarOG avatar={market.avatarUrl} size={200} />
        <div tw="flex flex-col" style={{ gap: '20px' }}>
          <span tw="text-4xl">Do you trust</span>
          <span tw="text-5xl font-medium" style={{ color: darkTheme.token.colorTextBase }}>
            {market.name}
          </span>
          <div tw="flex items-center text-4xl justify-between" style={{ gap: '32px' }}>
            <MarketStatOG
              icon={<BarChartSvg />}
              value={formatCurrency(market.stats.volumeTotalUsd, 'USD')}
              label="volume"
            />
            <MarketStatOG
              icon={<McapSvg />}
              value={formatCurrency(market.stats.marketCapUsd, 'USD')}
              label="mcap"
            />
          </div>
        </div>
      </div>
      <div tw="flex justify-between items-end w-full">
        <div
          tw="flex text-3xl leading-none rounded-200 py-6 px-9"
          style={{
            backgroundColor: darkTheme.token.colorTextBase,
            color: darkTheme.token.colorBgContainer,
          }}
        >
          View on Ethos Markets
        </div>
        <div tw="flex flex-col items-end" style={{ gap: '48px' }}>
          <VotePercentageOG percentage={trustPercentage} voteType="trust" />
          <VotePercentageOG percentage={100 - trustPercentage} voteType="distrust" />
        </div>
      </div>
    </div>
  );
}
