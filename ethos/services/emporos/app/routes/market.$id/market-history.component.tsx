import { BarChartOutlined } from '@ant-design/icons';
import { Await } from '@remix-run/react';
import { Flex, Segmented, Typography } from 'antd';
import { Suspense } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { formatEther } from 'viem';
import { ChartLogoWatermark } from '~/components/charts/chart-logo-watermark.tsx';
import { ChartSkeleton } from '~/components/charts/chart-skeleton.tsx';
import { FullSizePriceHistoryChart } from '~/components/charts/price/price-history-chart.component.client.tsx';
import { type ChartWindow, chartWindowOptions, type MarketPriceHistory } from '~/types/charts.ts';
import { type Market } from '~/types/markets.ts';
import { useChartParams } from '~/utils/chart.utils.ts';

export function MarketHistory({
  priceHistoryPromise,
  market,
}: {
  priceHistoryPromise: Promise<MarketPriceHistory>;
  market: Market;
}) {
  const [chartParams, setChartWindow] = useChartParams();

  return (
    <div className="relative px-4 lg:px-6">
      <Flex justify="space-between" className="py-4">
        <Typography.Title level={5} className="text-antd-colorTextHeading flex gap-1 items-center">
          <BarChartOutlined />
          Reputation history
        </Typography.Title>
        <Segmented<ChartWindow>
          options={[...chartWindowOptions]}
          value={chartParams.window}
          onChange={(window) => {
            setChartWindow({ window });
          }}
        />
      </Flex>
      <div className="h-80">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-antd-colorTextQuaternary">
          <ChartLogoWatermark />
        </div>
        <Suspense fallback={<ChartSkeleton />}>
          <Await resolve={priceHistoryPromise}>
            {(data) => (
              // Nivo Chart ESM support is currently broken, so we need to use it in a client-only component
              // https://github.com/plouc/nivo/issues/2310#issuecomment-2313388777
              <ClientOnly fallback={<ChartSkeleton />}>
                {() => (
                  <FullSizePriceHistoryChart
                    maxPriceEth={Number(
                      formatEther(market.stats.trustPrice + market.stats.distrustPrice, 'wei'),
                    )}
                    priceHistoryData={data}
                    chartWindow={chartParams.window}
                  />
                )}
              </ClientOnly>
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
