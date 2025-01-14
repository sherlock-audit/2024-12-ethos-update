import { formatCurrency } from '@ethos/helpers';
import { Link } from '@remix-run/react';
import { Button, Col, Flex, Row, Tooltip, Typography } from 'antd';
import { AnimatePresence } from 'framer-motion';
import { BarChartIcon } from '../icons/bar-chart.tsx';
import { DonutChartIcon } from '../icons/donut-chart.tsx';
import { TrustPercentageMeter } from '../trust-percentage-meter.tsx';
import { MarketAvatar } from '~/components/avatar/market-avatar.component.tsx';
import { ThumbsDownFilledIcon, ThumbsUpFilledIcon } from '~/components/icons/thumbs.tsx';
import { TrustHistoryGraph } from '~/components/trust-history-graph/trust-history-graph.tsx';
import { type Market } from '~/types/markets.ts';

export function LargeMarketCard({ market }: { market: Market }) {
  return (
    <Flex
      className="bg-antd-colorBgContainer rounded-lg p-3 relative overflow-clip isolate"
      vertical
      gap={12}
    >
      <AnimatePresence>
        <TrustHistoryGraph marketProfileId={market.profileId} />
      </AnimatePresence>
      <MarketCardInfo market={market} />
      <TrustPercentageMeter trustPercentage={Math.round(market.trustPercentage)} />
      <Row gutter={[8, 0]}>
        <Col span={12}>
          <Link to={`/market/${market.profileId}/?voteType=trust`} className="grow">
            <Button
              className="text-trust w-full xs:text-sm sm:text-base"
              size="large"
              icon={<ThumbsUpFilledIcon />}
            >
              Buy trust
            </Button>
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`/market/${market.profileId}/?voteType=distrust`} className="grow">
            <Button
              className="text-distrust w-full xs:text-sm sm:text-base"
              size="large"
              icon={<ThumbsDownFilledIcon />}
            >
              Buy distrust
            </Button>
          </Link>
        </Col>
      </Row>
    </Flex>
  );
}

export function MarketCardInfo({ market }: { market: Market }) {
  return (
    <Flex gap={14} align="start" className="min-w-0 flex-auto w-full">
      <Link to={`/market/${market.profileId}`}>
        <MarketAvatar avatarUrl={market.avatarUrl} size={74} />
      </Link>
      <Flex vertical className="min-w-0 flex-auto w-full" gap={4}>
        <Link to={`/market/${market.profileId}`} className="text-antd-colorTextBase">
          <Typography.Title
            ellipsis={{ tooltip: true, rows: 2 }}
            level={4}
            className="font-semibold leading-tight"
          >
            {market.name}?
          </Typography.Title>
        </Link>
        <MarketStats market={market} />
      </Flex>
    </Flex>
  );
}

function MarketStats({ market }: { market: Market }) {
  return (
    <Flex align="center" className="text-antd-colorTextTertiary" gap={8}>
      <Tooltip title="Total volume">
        <BarChartIcon /> {formatCurrency(market.stats.volumeTotalUsd, 'USD')}
      </Tooltip>
      <Tooltip title="Market cap">
        <DonutChartIcon /> {formatCurrency(market.stats.marketCapUsd, 'USD')}
      </Tooltip>
    </Flex>
  );
}
