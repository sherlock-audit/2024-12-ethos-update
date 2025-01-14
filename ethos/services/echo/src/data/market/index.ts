import {
  getMarketInfo,
  getMarketParticipants,
  type PrismaMarketInfo,
  getMarketPriceHistory,
  getTransactions,
  getMarketHolders,
  getAllMarkets,
  getMarketsByIds,
  getHoldingsByAddress,
  getHoldingsTotalByAddress,
  updateMarketStats,
} from './market.data.js';

export const MarketData = {
  getMarketsByIds,
  getMarketInfo,
  getMarketParticipants,
  getMarketPriceHistory,
  getTransactions,
  getMarketHolders,
  getAllMarkets,
  getHoldingsByAddress,
  getHoldingsTotalByAddress,
  updateMarketStats,
};

export type { PrismaMarketInfo };
