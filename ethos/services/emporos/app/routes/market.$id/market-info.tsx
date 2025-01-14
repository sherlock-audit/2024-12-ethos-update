import { Row, Col, Flex, Card } from 'antd';
import { MarketHistory } from './market-history.component.tsx';
import { ThumbsDownFilledIcon, ThumbsUpFilledIcon } from '~/components/icons/thumbs.tsx';
import { TrustPercentageMeter } from '~/components/trust-percentage-meter.tsx';
import { type MarketPriceHistory } from '~/types/charts.ts';
import { type Market } from '~/types/markets.ts';

export function MarketInfo({
  market,
  priceHistoryPromise,
}: {
  market: Market;
  priceHistoryPromise: Promise<MarketPriceHistory>;
}) {
  return (
    <Row
      gutter={[
        { xs: 16, sm: 16, md: 24 },
        { xs: 16, sm: 16, md: 24 },
      ]}
    >
      <Col span={24} className="mb-4">
        <Row>
          <Col span={24}>
            <Card
              classNames={{
                body: 'px-0',
              }}
            >
              <Flex align="center" gap={16} className="pb-4 px-6 border-b border-b-borderDark">
                <ThumbsUpFilledIcon className="text-xl text-trust" />
                <TrustPercentageMeter
                  trustPercentage={Math.round(market.trustPercentage)}
                  strokeHeight={4}
                  gap={12}
                />
                <ThumbsDownFilledIcon className="text-xl text-distrust" />
              </Flex>
              <MarketHistory market={market} priceHistoryPromise={priceHistoryPromise} />
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
