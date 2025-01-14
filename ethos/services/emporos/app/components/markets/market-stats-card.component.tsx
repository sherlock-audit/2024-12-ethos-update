import { formatCurrency } from '@ethos/helpers';
import { Link } from '@remix-run/react';
import { Flex, Typography } from 'antd';
import { HandshakeIcon } from '../icons/handshake.tsx';
import { LineChartIcon } from '../icons/line-chart.tsx';
import { StatTag } from '../stat-tag.tsx';
import { MarketAvatar } from '~/components/avatar/market-avatar.component.tsx';
import { type MarketVolume } from '~/types/markets.ts';

export type MarketStatsCardProps = MarketVolume & {
  accessory?: JSX.Element;
};
export function MarketStatsCard({
  market,
  volumeUsd,
  trustPercentage,
  accessory,
}: MarketStatsCardProps) {
  return (
    <Link to={`/market/${market.profileId}`} className="relative">
      <Flex
        align="center"
        justify="space-between"
        gap={6}
        className="bg-antd-colorBgContainer rounded-lg p-5"
      >
        <Flex align="center" justify="left" gap={16}>
          <MarketAvatar avatarUrl={market.avatarUrl} size="small" />
          <Flex vertical justify="center" gap={4}>
            <Typography.Text type="secondary">
              <span>
                <HandshakeIcon /> Trust in
              </span>
            </Typography.Text>
            <Typography.Title level={5}>{market.name}</Typography.Title>
            <Flex align="center" justify="left" gap={12}>
              <StatTag value={`${Math.round(trustPercentage)}%`} />
              <StatTag icon={<LineChartIcon />} value={formatCurrency(volumeUsd, 'USD')} />
            </Flex>
          </Flex>
        </Flex>
        {accessory}
      </Flex>
    </Link>
  );
}
