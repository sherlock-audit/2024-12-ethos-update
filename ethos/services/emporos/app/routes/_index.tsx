import { duration, formatCurrency, formatNumber } from '@ethos/helpers';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Await, Link, useLoaderData } from '@remix-run/react';
import { Button, Carousel, Col, Divider, Grid, Flex, List, Row, Typography, Tooltip } from 'antd';
import { type CarouselRef } from 'antd/es/carousel';
import { type PropsWithChildren, Suspense, useRef } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { formatEther } from 'viem';
import { ActivityListItem } from '~/components/activity-list-item.component.tsx';
import { MarketAvatar } from '~/components/avatar/market-avatar.component.tsx';
import { ChangeIndicator } from '~/components/change-indicator.component.tsx';
import { ChartSkeleton } from '~/components/charts/chart-skeleton.tsx';
import { CompactPriceHistoryChart } from '~/components/charts/price/price-history-chart.component.client.tsx';
import { GenericErrorBoundary } from '~/components/error/generic-error-boundary.tsx';
import { BarChartIcon } from '~/components/icons/bar-chart.tsx';
import { ChevronLeftIcon } from '~/components/icons/chevron-left.tsx';
import { ChevronRightIcon } from '~/components/icons/chevron-right.tsx';
import { CommentIcon } from '~/components/icons/comment.tsx';
import { DonutChartIcon } from '~/components/icons/donut-chart.tsx';
import { HeartIcon } from '~/components/icons/heart.tsx';
import { RetweetIcon } from '~/components/icons/retweet.tsx';
import { XLogo } from '~/components/icons/x-logo.tsx';
import { MarketLogo } from '~/components/market-logo.tsx';
import { LargeMarketCard } from '~/components/markets/large-market-card.component.tsx';
import { Marquee } from '~/components/marquee/Marquee.tsx';
import { RelativeDateTime } from '~/components/relative-time.component.tsx';
import { getAllRecentActivity } from '~/services.server/market-activity.ts';
import { getMarketList, getTopVolume, getTrendingMarkets } from '~/services.server/markets.ts';
import { type MarketVolume } from '~/types/markets.ts';

import { cn } from '~/utils/cn.ts';

export async function loader(_args: LoaderFunctionArgs) {
  const oneDayAgo = new Date(Date.now() - duration(1, 'day').toMilliseconds());
  const [allMarkets, trendingMarkets] = await Promise.all([getMarketList(), getTrendingMarkets()]);

  const topVolume = getTopVolume(oneDayAgo, 8);
  const recentActivityPromise = getAllRecentActivity('all', { limit: 6, offset: 0 });

  return {
    trendingMarkets,
    allMarkets,
    topVolume,
    recentActivity: recentActivityPromise,
  };
}

function HomeSection({ children, contrast = false }: PropsWithChildren<{ contrast?: boolean }>) {
  return (
    <div className={cn({ 'bg-antd-colorBgBase': contrast })}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">{children}</div>
    </div>
  );
}

export default function Index() {
  return (
    <div className="bg-bgDeep pb-24 top-0 w-screen">
      <MarketsTicker />
      <TrendingMarketsSection />
      <AllMarketsSection />
      <VersusMarkets />
      <ActivitySection />
    </div>
  );
}

function MarketsTicker() {
  const { allMarkets } = useLoaderData<typeof loader>();

  if (allMarkets.length === 0) {
    return null;
  }

  return (
    <Marquee
      pauseOnHover
      className="bg-tickerBg border-t border-t-antd-colorFill dark:border-t-antd-colorFillTertiary"
    >
      {allMarkets.map((market) => (
        <Link
          key={market.profileId}
          to={`/market/${market.profileId}`}
          className={cn('whitespace-nowrap flex items-center gap-2 p-2')}
        >
          <MarketAvatar avatarUrl={market.avatarUrl} size={20} />
          <Typography.Text className="text-base flex items-center gap-1 text-antd-colorTextBase font-plex">
            ${market.name}{' '}
            <ChangeIndicator change={market.stats.priceChange24hPercent} format="percentage" />
          </Typography.Text>
        </Link>
      ))}
    </Marquee>
  );
}

function TrendingMarketsSection() {
  const { trendingMarkets } = useLoaderData<typeof loader>();
  const breakpoints = Grid.useBreakpoint();
  const carouselRef = useRef<CarouselRef>(null);

  if (trendingMarkets.length === 0) {
    return;
  }

  return (
    <HomeSection>
      <Row className="md:w-full xl:w-9/12 mx-auto py-3">
        <Col span={24}>
          <div className="flex justify-between lg:justify-center">
            <Typography.Title level={1} className="lg:text-center">
              Trending
            </Typography.Title>
            {trendingMarkets.length > 1 && (
              <div className="lg:hidden">
                <Button
                  type="text"
                  size="large"
                  icon={<ChevronLeftIcon className="text-3xl text-antd-colorTextSecondary" />}
                  onClick={() => carouselRef.current?.prev()}
                />
                <Button
                  type="text"
                  size="large"
                  icon={<ChevronRightIcon className="text-3xl text-antd-colorTextSecondary" />}
                  onClick={() => carouselRef.current?.next()}
                />
              </div>
            )}
          </div>
          <Carousel
            ref={carouselRef}
            arrows={breakpoints.lg && trendingMarkets.length > 1}
            dots={false}
            className="mt-4 mb-8"
            speed={500}
          >
            {trendingMarkets.map((trending) => (
              <div className="flex justify-center items-center" key={trending.market.profileId}>
                <div
                  className="lg:mx-8 overflow-x-hidden lg:w-fit md:min-w-[min(800px,90vw)] bg-antd-colorBgContainer px-5 py-5 md:rounded-lg"
                  key={trending.market.profileId}
                >
                  <CarouselCard trend={trending} />
                </div>
              </div>
            ))}
          </Carousel>
        </Col>
      </Row>
    </HomeSection>
  );
}

function AllMarketsSection() {
  const { allMarkets } = useLoaderData<typeof loader>();

  return (
    <HomeSection contrast>
      <Row className="py-3">
        <Col span={24}>
          <Typography.Title level={3}>Markets</Typography.Title>
        </Col>
      </Row>
      <Row gutter={[30, 30]} className="pb-12">
        {allMarkets.map((market) => (
          <Col xs={24} md={12} lg={8} key={market.profileId}>
            <LargeMarketCard market={market} />
          </Col>
        ))}
      </Row>
    </HomeSection>
  );
}

function VersusMarkets() {
  const { allMarkets } = useLoaderData<typeof loader>();

  if (allMarkets.length < 2) {
    return null;
  }
  // Just picking the two with the most lifetime volume.
  const sortedMarkets = [...allMarkets].sort(
    (a, b) => b.stats.volumeTotalUsd - a.stats.volumeTotalUsd,
  );

  const [market1, market2] = sortedMarkets;

  return (
    <Row className="py-3 px-8">
      <Col span={24}>
        <div className="flex flex-col-reverse lg:flex-row items-center lg:justify-center py-2 md:py-6 md:gap-4">
          <div className="flex gap-4 items-start justify-end w-full">
            <Flex vertical align="end" gap={6} className="text-right">
              <span className="truncate text-5xl font-queens">
                <span className="inline mr-2 text-xl font-semibold">
                  <ChangeIndicator
                    change={market1.stats.priceChange24hPercent}
                    format="percentage"
                  />
                </span>
                {Math.round(market2.trustPercentage)}%
              </span>
              <span className="w-full font-queens text-2xl">Do you trust {market2.name}?</span>
              <Link to={`/market/${market2.profileId}/?voteType=trust`}>
                <Button className="text-trust bg-antd-colorBgContainer px-10" size="large">
                  Buy trust
                </Button>
              </Link>
            </Flex>
            <MarketAvatar avatarUrl={market2.avatarUrl} size={128} />
          </div>

          <div className="w-8/12 md:w-4/12 lg:w-fit flex-none">
            <Divider variant="solid" className="lg:hidden border-antd-colorText my-8">
              <h3 className="px-4 py-2 rounded-lg text-5xl text-center">VS</h3>
            </Divider>
            <span className="hidden lg:block text-center px-4 py-2 rounded-lg text-5xl font-queens">
              VS
            </span>
          </div>
          <div className="flex gap-4 items-start w-full">
            <MarketAvatar avatarUrl={market1.avatarUrl} size={128} />
            <Flex vertical align="start" gap={6} className="w-full">
              <span className="truncate text-5xl font-queens">
                {Math.round(market1.trustPercentage)}%
                <span className="inline ml-2 text-xl font-semibold">
                  <ChangeIndicator
                    change={market1.stats.priceChange24hPercent}
                    format="percentage"
                  />
                </span>
              </span>
              <span className="w-full font-queens text-2xl">
                Do you trust <span>{market1.name}</span>?
              </span>
              <Link to={`/market/${market1.profileId}/?voteType=trust`}>
                <Button className="text-trust bg-antd-colorBgContainer px-10" size="large">
                  Buy trust
                </Button>
              </Link>
            </Flex>
          </div>
        </div>
      </Col>
    </Row>
  );
}

function ActivitySection() {
  const { topVolume, recentActivity } = useLoaderData<typeof loader>();

  return (
    <HomeSection contrast>
      <Row gutter={[32, 32]} className="py-3">
        <Col xs={24} md={12}>
          <Typography.Title level={3}>Recent activity</Typography.Title>
          <List>
            <Suspense fallback={<RecentActivitySkeleton />}>
              <Await resolve={recentActivity}>
                {(activities) =>
                  activities.values.map((activity) => (
                    <ActivityListItem key={activity.eventId} activity={activity} />
                  ))
                }
              </Await>
            </Suspense>
          </List>
        </Col>
        <Col xs={24} md={12} className="">
          <Typography.Title level={3}>Top volume</Typography.Title>
          <List>
            <Suspense fallback={<ActivityListItem.Skeleton />}>
              <Await resolve={topVolume}>
                {(volume) =>
                  volume.map((v) => <VolumeListItem key={v.market.profileId} volume={v} />)
                }
              </Await>
            </Suspense>
          </List>
        </Col>
      </Row>
    </HomeSection>
  );
}

function RecentActivitySkeleton() {
  return Array.from({ length: 6 }).map((_, index) => (
    <Col sm={24} md={12} key={index}>
      <ActivityListItem.Skeleton />
    </Col>
  ));
}

function VolumeListItem({ volume }: { volume: MarketVolume }) {
  return (
    <List.Item className="border-b border-borderSecondary list-none">
      <Flex className="w-full" gap={16}>
        <Link to={`/market/${volume.market.profileId}`}>
          <MarketAvatar avatarUrl={volume.market.avatarUrl} size={48} />
        </Link>
        <Flex vertical className="w-full">
          <Flex justify="space-between">
            <Typography.Text>Do you trust</Typography.Text>
            <Typography.Text>
              <BarChartIcon /> {formatCurrency(volume.volumeUsd, 'USD')}
            </Typography.Text>
          </Flex>
          <Link
            to={`/market/${volume.market.profileId}`}
            className="text-antd-colorTextBase font-semibold"
          >
            {volume.market.name}?
          </Link>
        </Flex>
      </Flex>
    </List.Item>
  );
}

function CarouselCard({
  trend,
}: {
  trend: Awaited<ReturnType<typeof loader>>['trendingMarkets'][number];
}) {
  const { market, highlightedTweet, priceHistoryData } = trend;

  return (
    <Row gutter={[32, 32]}>
      <Col xs={24} sm={24} md={12}>
        <Flex gap={14} align="start" className="min-w-0 mb-8 flex-auto w-full">
          <Link to={`/market/${market.profileId}`}>
            <MarketAvatar avatarUrl={market.avatarUrl} size={64} />
          </Link>
          <Flex vertical className="min-w-0 flex-auto w-full" gap={2}>
            <Flex className="min-w-0" gap={14}>
              <Link
                to={`/market/${market.profileId}`}
                className="text-antd-colorTextBase flex flex-col gap-0.5"
              >
                <Typography.Text
                  ellipsis={{ tooltip: true }}
                  className="text-antd-colorText leading-tight"
                >
                  Do you trust
                </Typography.Text>
                <Typography.Paragraph
                  ellipsis={{ tooltip: true, rows: 2 }}
                  className="font-semibold leading-tight font-sans mb-0 text-xl/7 text-balance"
                >
                  {market.name}?
                </Typography.Paragraph>
              </Link>
            </Flex>
            <Flex justify="space-between" align="center">
              <span className="truncate text-antd-colorTextTertiary">
                <span>
                  <Tooltip title="Total volume">
                    <BarChartIcon /> {formatCurrency(market.stats.volumeTotalUsd, 'USD')}
                  </Tooltip>
                </span>{' '}
                <span>
                  <Tooltip title="Market cap">
                    <DonutChartIcon /> {formatCurrency(market.stats.marketCapUsd, 'USD')}
                  </Tooltip>
                </span>
              </span>
            </Flex>
          </Flex>
        </Flex>
        {highlightedTweet && (
          <div className="mt-10 dark:bg-[url(/assets/double-quote-dark.svg)] bg-[url(/assets/double-quote-light.svg)] bg-right-top bg-no-repeat">
            <Flex
              justify="space-between"
              align="center"
              className="text-antd-colorTextTertiary text-xs"
            >
              <span className="flex items-center gap-1">
                <XLogo className="text-[32px]" />
                <Link
                  className="text-antd-colorTextTertiary"
                  to={highlightedTweet.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{market.name} on x.com</span>
                </Link>
              </span>
              <span>
                <RelativeDateTime verbose timestamp={highlightedTweet.createdAt} />
              </span>
            </Flex>
            <div>
              <span className="text-antd-colorTextSecondary font-light leading-7 text-wrap line-clamp-6 break-words">
                {highlightedTweet.text}
              </span>
              <Flex gap={16} className="text-antd-colorTextTertiary">
                <span>
                  <CommentIcon /> {formatNumber(highlightedTweet.replies)}
                </span>
                <span>
                  <RetweetIcon /> {formatNumber(highlightedTweet.retweets)}
                </span>
                <span>
                  <HeartIcon /> {formatNumber(highlightedTweet.likes)}
                </span>
                <span>
                  <BarChartIcon /> {formatNumber(highlightedTweet.impressions)}
                </span>
              </Flex>
            </div>
          </div>
        )}
      </Col>
      <Col xs={24} sm={24} md={12}>
        <Row gutter={[8, 0]}>
          <Col span={24}>
            <Flex className="flex items-center justify-between">
              <span className="font-queens text-antd-colorText ml-2 xs:text-3xl sm:text-5xl">
                {market.trustPercentage.toFixed(0)}% trust
              </span>
              <MarketLogo />
            </Flex>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="h-[200px]">
            <ClientOnly fallback={<ChartSkeleton />}>
              {() => (
                <CompactPriceHistoryChart
                  maxPriceEth={Number(
                    formatEther(market.stats.trustPrice + market.stats.distrustPrice, 'wei'),
                  )}
                  priceHistoryData={priceHistoryData}
                  chartWindow="1H"
                />
              )}
            </ClientOnly>
          </Col>
        </Row>
        <Row gutter={[8, 0]}>
          <Col span={12}>
            <Link to={`/market/${market.profileId}/?voteType=trust`} className="grow">
              <Button className="w-full font-queens text-trust xs:text-lg sm:text-2xl" size="large">
                Buy trust
              </Button>
            </Link>
          </Col>
          <Col span={12}>
            <Link to={`/market/${market.profileId}/?voteType=distrust`} className="grow">
              <Button
                className="w-full font-queens text-distrust xs:text-lg sm:text-2xl"
                size="large"
              >
                Buy distrust
              </Button>
            </Link>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export function ErrorBoundary() {
  return <GenericErrorBoundary />;
}
