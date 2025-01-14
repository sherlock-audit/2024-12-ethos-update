import { emporosUrlMap } from '@ethos/env';
import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useSearchParams } from '@remix-run/react';
import { Col, Flex, Grid, Row, Select } from 'antd';
import { EthosProfileInfo } from './ethos.profile.info.component.tsx';
import { GetYourOwnMarketCard } from './get-your-own-market-card.component.tsx';
import { MarketInfoHeader } from './market-info-header.component.tsx';
import { MarketInfo } from './market-info.tsx';
import { OpenPositions } from './open-positions.tsx';
import { TabSection } from './tab-section.tsx';
import { TransactionProvider } from './transaction-context.tsx';
import { TransactionFooter } from './transaction-footer.tsx';
import { GenericErrorBoundary } from '~/components/error/generic-error-boundary.tsx';
import { TransactionForm } from '~/components/transact-form/transact-form.component.tsx';
import { getEnvironmentFromMatches } from '~/hooks/env.tsx';
import { getMarketPriceHistory } from '~/services.server/market-activity.ts';
import {
  getEthosProfileStatsByProfileId,
  getMarketInfoByProfileId,
} from '~/services.server/markets.ts';
import { getChartParams } from '~/utils/chart.utils.ts';
import { type VoteTypeFilter, getVoteTypeFilter } from '~/utils/getVoteTypeFilter.ts';
import { mergeMeta } from '~/utils/merge-meta.ts';
import { generateOgMetadata } from '~/utils/og.utils.ts';

export const meta: MetaFunction<typeof loader> = mergeMeta(({ data, matches }) => {
  const environment = getEnvironmentFromMatches(matches);

  if (!data) return [];

  const imageUrl = new URL(
    `/og/market/${data.market.profileId}`,
    emporosUrlMap[environment],
  ).toString();

  return generateOgMetadata({
    title: `Do You Trust ${data.market.name}?`,
    description: `${data.market.name}'s trust score is currently ${data.market.trustPercentage.toFixed(0)}%. Disagree? Jump in and start trading today`,
    image: imageUrl,
  });
});

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { window } = getChartParams(request);
  const [market, ethosProfileStats] = await Promise.all([
    getMarketInfoByProfileId(Number(params.id)),
    getEthosProfileStatsByProfileId(Number(params.id)),
  ]);

  const priceHistoryPromise = getMarketPriceHistory(Number(params.id), window);

  if (!market) {
    throw new Response('Market not found', {
      status: 404,
      statusText: 'Not Found',
    });
  }

  return { market, priceHistoryPromise, ethosProfileStats };
}

const activityOptions: Array<{ value: VoteTypeFilter; label: string }> = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'trust',
    label: 'Trust',
  },
  {
    value: 'distrust',
    label: 'Distrust',
  },
];

export default function MarketPage() {
  const { market, priceHistoryPromise, ethosProfileStats } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const breakpoints = Grid.useBreakpoint();

  function onChange(value: VoteTypeFilter) {
    searchParams.set('filter', value);
    setSearchParams(searchParams, {
      preventScrollReset: true,
    });
  }

  return (
    <TransactionProvider market={market}>
      <div className="w-full min-h-screen flex flex-col">
        <Row gutter={[24, 24]} className="mb-4">
          <Col xs={24} md={24}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12} lg={12}>
                <MarketInfoHeader market={market} />
              </Col>
              <Col xs={24} md={12} lg={12}>
                <EthosProfileInfo market={market} ethosProfileStats={ethosProfileStats} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={[24, 24]} className="flex-grow relative">
          <Col xs={24} md={15} lg={16} xl={17} xxl={18} className="h-full">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <MarketInfo market={market} priceHistoryPromise={priceHistoryPromise} />
                <OpenPositions />
                <div className="md:hidden mt-6">
                  <GetYourOwnMarketCard />
                </div>
              </Col>
              <Col span={24}>
                <Flex vertical gap={16} className="w-full">
                  <div className="flex justify-between flex-col sm:flex-row gap-4">
                    <TabSection />
                    <Select
                      options={activityOptions}
                      value={getVoteTypeFilter(searchParams.get('filter') ?? '')}
                      onChange={onChange}
                      className="min-w-[120px] [&_.ant-select-selector]:!bg-antd-colorBgContainer"
                    />
                  </div>
                  <Outlet />
                </Flex>
              </Col>
            </Row>
          </Col>
          <Col xs={0} md={9} lg={8} xl={7} xxl={6} className="sticky top-4 h-max self-start">
            <Row gutter={[24, 12]}>
              <TransactionForm />
              <GetYourOwnMarketCard />
            </Row>
          </Col>
        </Row>
        {!breakpoints.md && <TransactionFooter />}
      </div>
    </TransactionProvider>
  );
}

export function ErrorBoundary() {
  return <GenericErrorBoundary />;
}
