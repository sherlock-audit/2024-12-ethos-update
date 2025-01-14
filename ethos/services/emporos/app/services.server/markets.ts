import { type MarketHoldingsByAddressRequest } from '@ethos/echo-client';
import { duration, formatCurrency, formatEth, notEmpty, toNumber } from '@ethos/helpers';
import { getMarketPriceHistory } from './market-activity.ts';
import { getMarketUsersByAddresses, searchMarketsUsers } from './users.ts';
import { getTopMoversSince, getTopVolumeSince } from '~/data.server/price-history.ts';
import {
  getAllMarkets,
  getEthExchangeRate,
  getEthToUsdRate,
  getHoldingsByAddress,
  getMarket,
  getMarketHolders,
  getMarketNews,
  getMarketsByIds,
  getReviewStatsByProfileId,
  getVouchStatsByProfileId,
  searchMarkets as searchEchoMarkets,
} from '~/services.server/echo.ts';
import { type MarketPriceHistory } from '~/types/charts.ts';
import {
  type MarketHoldersInfo,
  type Market,
  type TrendingMarket,
  type EthosProfileStats,
  type MarketVolume,
} from '~/types/markets.ts';
import { type MarketUser } from '~/types/user.ts';

import { weiToUsd } from '~/utils/currency.utils.ts';

function convertToMarket(
  market: NonNullable<Awaited<ReturnType<typeof getMarket>>>,
  ethUsdRate: number,
): Market {
  return {
    profileId: market.marketProfileId,
    createdAt: market.createdAt,
    avatarUrl: market.profile.avatarUrl,
    ethosScore: market.profile.ethosScore,
    name: market.profile.name,
    twitterUsername: market.profile.twitterUsername,
    address: market.profile.primaryAddress,
    basePrice: BigInt(market.basePrice),
    trustPercentage:
      Number(
        Number(market.positivePrice) /
          Number(BigInt(market.positivePrice) + BigInt(market.negativePrice)),
      ) * 100,
    stats: {
      marketCapWei: BigInt(market.stats.marketCapWei),
      marketCapUsd: weiToUsd(BigInt(market.stats.marketCapWei), ethUsdRate),
      volumeTotalUsd: weiToUsd(BigInt(market.stats.volumeTotalWei), ethUsdRate),
      volume24hUsd: weiToUsd(BigInt(market.stats.volume24hWei), ethUsdRate),
      priceChange24hPercent: market.stats.priceChange24hPercent,
      trustPrice: BigInt(market.positivePrice),
      distrustPrice: BigInt(market.negativePrice),
      trustVotes: market.trustVotes,
      distrustVotes: market.distrustVotes,
    },
  };
}

export async function getMarketInfoByProfileId(profileId: number): Promise<Market | null> {
  const [m, ethUsdRate] = await Promise.all([getMarket(profileId), getEthExchangeRate()]);

  if (!m) {
    return null;
  }

  return convertToMarket(m, ethUsdRate.price);
}

export async function getMarketsByProfileIds(profileIds: number[]): Promise<Market[]> {
  const [markets, ethUsdRate] = await Promise.all([
    getMarketsByIds(profileIds),
    getEthExchangeRate(),
  ]);

  return markets.map((m) => convertToMarket(m, ethUsdRate.price));
}

export async function getMarketHoldersByType(
  profileId: number,
  type: 'all' | 'trust' | 'distrust',
) {
  const holders = await getMarketHolders(profileId);

  return holders[type];
}

export async function getMarketList(): Promise<Market[]> {
  const [markets, ethUsdRate] = await Promise.all([getAllMarkets(), getEthExchangeRate()]);

  return markets.map((m) => convertToMarket(m, ethUsdRate.price));
}

export async function getTrendingMarkets(): Promise<TrendingMarket[]> {
  // Get the Top 4 markets by volume over the last 24 hours.
  const markets = await getTopVolume(new Date(Date.now() - duration(1, 'day').toMilliseconds()), 4);
  const [marketsWithStats, allPriceHistoryData, marketsNews] = await Promise.all([
    Promise.all(markets.map(async (m) => await getMarketInfoByProfileId(m.market.profileId))),
    Promise.all(
      markets.map(
        async (m) =>
          await getMarketPriceHistory(m.market.profileId, '1H').then((data) => ({
            marketProfileId: m.market.profileId,
            data,
          })),
      ),
    ),
    getMarketNews(markets.flatMap((m) => m.market.profileId)),
  ]);

  const priceHistoryDataByMarketId = allPriceHistoryData.reduce<Record<number, MarketPriceHistory>>(
    (acc, priceHistoryData) => {
      acc[priceHistoryData.marketProfileId] = priceHistoryData.data;

      return acc;
    },
    {},
  );

  const tweetsByMarketId = marketsNews.reduce<
    Record<number, { tweet: Awaited<ReturnType<typeof getMarketNews>>[number]['tweet'] }>
  >((acc, newsItem) => {
    acc[newsItem.marketProfileId] = newsItem;

    return acc;
  }, {});

  return marketsWithStats.filter(notEmpty).map((market) => ({
    market,
    highlightedTweet: tweetsByMarketId[market.profileId]?.tweet,
    priceHistoryData: priceHistoryDataByMarketId[market.profileId],
  }));
}

export async function search(query: string) {
  const [markets, users] = await Promise.all([searchMarkets(query), searchMarketsUsers(query)]);

  return {
    markets,
    users,
  };
}

export async function searchMarkets(query: string): Promise<Market[]> {
  const markets = await searchEchoMarkets(query);

  return markets.map(convertToMarket);
}

export async function getTopVolume(since: Date, limit: number = 10): Promise<MarketVolume[]> {
  const [topVolume, ethUsdRate] = await Promise.all([
    getTopVolumeSince(since, limit),
    getEthExchangeRate(),
  ]);

  const markets = await getMarketsByIds(topVolume.map((t) => t.marketProfileId));

  const results = topVolume
    .map((t) => {
      const market = markets.find((m) => m?.marketProfileId === t.marketProfileId);

      if (!market) return null;

      return {
        market: convertToMarket(market, ethUsdRate.price),
        trustPercentage:
          Number(
            Number(market.positivePrice) /
              Number(BigInt(market.positivePrice) + BigInt(market.negativePrice)),
          ) * 100,
        volumeWei: t.volumeTotalWei,
        volumeUsd: weiToUsd(t.volumeTotalWei, ethUsdRate.price),
      };
    })
    .filter(notEmpty);

  return results;
}

export async function getTopVolumeMarkets(since: Date, limit: number = 10): Promise<Market[]> {
  const topVolume = await getTopVolumeSince(since, limit);

  const markets = await getMarketsByIds(topVolume.map((t) => t.marketProfileId));

  return markets.map(convertToMarket);
}

export async function getTopMovers(since: Date, limit: number = 10): Promise<Market[]> {
  const topMovers = await getTopMoversSince(since, limit);

  const markets = await Promise.all(
    topMovers.map(async (t) => await getMarketInfoByProfileId(t.marketProfileId)),
  );

  return markets.filter(notEmpty);
}

export async function getUserHoldingsByAddress(params: MarketHoldingsByAddressRequest) {
  const holdings = await getHoldingsByAddress(params);
  const markets = await getMarketsByIds([...new Set(holdings.map((h) => h.marketProfileId))]);

  const marketProfilesMap = markets.reduce<Record<number, (typeof markets)[number]>>(
    (acc, market) => {
      acc[market.marketProfileId] = market;

      return acc;
    },
    {},
  );

  return holdings.map((h) => ({
    ...h,
    market: marketProfilesMap[h.marketProfileId],
  }));
}

export async function getMarketHoldersInfo(
  marketId: number,
  type: 'all' | 'trust' | 'distrust',
): Promise<MarketHoldersInfo[]> {
  const holders = await getMarketHoldersByType(marketId, type);
  const users = await getMarketUsersByAddresses(holders.map((a) => a.actorAddress));

  const usersMap = users.reduce<Record<string, MarketUser>>((acc, user) => {
    acc[user.address] = user;

    return acc;
  }, {});

  return holders.slice(0, 12).map((h) => ({
    ...h,
    user: usersMap[h.actorAddress],
  }));
}

export async function getEthosProfileStatsByProfileId(
  profileId: number,
): Promise<EthosProfileStats> {
  const [vouchStats, reviewStats, ethUsdRate] = await Promise.all([
    getVouchStatsByProfileId(profileId),
    getReviewStatsByProfileId(profileId),
    getEthToUsdRate(),
  ]);

  const amountInEth = vouchStats[profileId]?.staked.received;
  const amountInUsd = ethUsdRate ? toNumber(amountInEth) * ethUsdRate : null;

  return {
    vouchedAmountInEthFormatted: amountInEth ? formatEth(amountInEth, 'eth') : null,
    vouchedAmountInUsdFormatted: amountInUsd ? formatCurrency(amountInUsd, 'USD') : null,
    positiveReviewPercentage: reviewStats.total?.positiveReviewPercentage ?? 0,
    receivedReviewsCount: reviewStats.total?.received ?? 0,
  };
}
