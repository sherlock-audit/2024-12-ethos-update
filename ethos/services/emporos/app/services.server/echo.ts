import { toUserKey, type EthosUserTarget } from '@ethos/domain';
import {
  echoClient,
  type MarketTransactionHistoryByAddressRequest,
  type MarketTransactionHistoryRequest,
  type MarketHoldingsByAddressRequest,
  setEchoConfig,
} from '@ethos/echo-client';
import { echoUrlMap } from '@ethos/env';
import { type Address } from 'viem';
import { config } from '~/config/config.server.ts';

setEchoConfig({
  baseUrl: config.ECHO_BASE_URL ?? echoUrlMap[config.ETHOS_ENV],
  ethosService: `emporos-${config.ETHOS_ENV}`,
});

export async function getMarket(marketProfileId: number) {
  return await echoClient.markets.info(marketProfileId);
}

export async function getMarketsByIds(marketProfileIds: number[]) {
  return await echoClient.markets.infoByIds({ profileIds: marketProfileIds });
}

export async function getEthExchangeRate() {
  return await echoClient.exchangeRates.getEthPriceInUSD();
}

export async function getActor(target: EthosUserTarget) {
  return await echoClient.activities.actor(target);
}

export async function getAllMarkets() {
  return await echoClient.markets.search({});
}

export async function searchMarkets(query: string) {
  return await echoClient.markets.search({ query });
}

export async function getRecentActivity(params: MarketTransactionHistoryRequest) {
  return await echoClient.markets.transactionHistory(params);
}

export async function getRecentActivityByAddress(params: MarketTransactionHistoryByAddressRequest) {
  return await echoClient.markets.txHistoryByAddress(params);
}
export async function getProfiles(profileIds: number[]) {
  return await echoClient.profiles.query({ ids: profileIds });
}

export async function getActorsByTarget(targets: EthosUserTarget[]) {
  return await echoClient.activities.actorsBulk(targets);
}

export async function getMarketHolders(profileId: number) {
  return await echoClient.markets.holders(profileId);
}

export async function getMarketInfo(profileId: number) {
  return await echoClient.markets.info(profileId);
}

export async function getHoldingsByAddress(params: MarketHoldingsByAddressRequest) {
  return await echoClient.markets.holdingsByAddress(params);
}

export async function getHoldingsTotalByAddress(address: Address) {
  return await echoClient.markets.holdingsTotalByAddress(address);
}

export async function getMarketVolumeTradedByAddress(address: Address) {
  return await echoClient.markets.volumeByAddress(address);
}

export async function getVouchStatsByProfileId(profileId: number) {
  return await echoClient.vouches.stats({ profileIds: [profileId] });
}

export async function getReviewStatsByProfileId(profileId: number) {
  return await echoClient.reviews.stats({ target: toUserKey({ profileId }) });
}

export async function getEthToUsdRate() {
  try {
    const data = await echoClient.exchangeRates.getEthPriceInUSD();

    return data.price;
  } catch {
    return null;
  }
}

export async function getMarketNews(profileIds: number[]) {
  return await echoClient.markets.news(profileIds);
}

export async function getEnsDetailsByName(ensName: string) {
  return await echoClient.ens.getDetailsByName(ensName);
}
