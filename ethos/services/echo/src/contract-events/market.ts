import { type MarketTypes } from '@ethos/contracts';
import { getDateFromUnix } from '@ethos/helpers';
import { type Prisma as PrismaPostgres } from '@prisma-pg/client';
import { type Prisma as PrismaTimescale } from '@prisma-timescale/client';
import { blockchainManager } from '../common/blockchain-manager.js';
import { prisma as prismaPostgres } from '../data/db.js';
import { MarketData } from '../data/market/index.js';
import { prisma as prismaTimescale } from '../data/timescale-db.js';
import { type EventProcessor, type WrangledEvent } from './event-processing.js';

type Payload = {
  marketCreates: PrismaPostgres.MarketCreateManyInput[];
  marketUpdates: PrismaPostgres.MarketUpdateManyArgs[];
  marketPriceEventCreates: PrismaTimescale.MarketPricesCreateManyInput[];
  marketUpdateEventCreates: PrismaPostgres.MarketUpdatedEventCreateManyInput[];
  marketVoteEventCreates: PrismaPostgres.MarketVoteEventCreateManyInput[];
  marketVoteStatCreates: PrismaTimescale.MarketVotesCreateManyInput[];
  marketProfileIds: Set<number>;
};

type EventUnion =
  | WrangledEvent<'MarketCreated', MarketTypes.MarketCreatedEvent.LogDescription>
  | WrangledEvent<'VotesBought', MarketTypes.VotesBoughtEvent.LogDescription>
  | WrangledEvent<'VotesSold', MarketTypes.VotesSoldEvent.LogDescription>
  | WrangledEvent<'MarketUpdated', MarketTypes.MarketUpdatedEvent.LogDescription>;

export const marketEventProcessor: EventProcessor<EventUnion, Payload> = {
  ignoreEvents: new Set([]),
  getLogs: async (...args) => await blockchainManager.getMarketEvents(...args),
  parseLog: (log) => blockchainManager.reputationMarket.contract.interface.parseLog(log),
  eventWrangler: (parsed) => {
    switch (parsed.name) {
      case 'MarketCreated': {
        return {
          ...(parsed as unknown as MarketTypes.MarketCreatedEvent.LogDescription),
          name: parsed.name,
        };
      }
      case 'VotesBought': {
        return {
          ...(parsed as unknown as MarketTypes.VotesBoughtEvent.LogDescription),
          name: parsed.name,
        };
      }
      case 'VotesSold': {
        return {
          ...(parsed as unknown as MarketTypes.VotesSoldEvent.LogDescription),
          name: parsed.name,
        };
      }
      case 'MarketUpdated': {
        return {
          ...(parsed as unknown as MarketTypes.MarketUpdatedEvent.LogDescription),
          name: parsed.name,
        };
      }
    }

    return null;
  },
  preparePayload: async (events) => {
    const marketCreates: PrismaPostgres.MarketCreateManyInput[] = [];
    const marketUpdates: PrismaPostgres.MarketUpdateManyArgs[] = [];
    const marketPriceEventCreates: PrismaTimescale.MarketPricesCreateManyInput[] = [];
    const marketUpdateEventCreates: PrismaPostgres.MarketUpdatedEventCreateManyInput[] = [];
    const marketVoteEventCreates: PrismaPostgres.MarketVoteEventCreateManyInput[] = [];
    const marketProfileIds = new Set<number>();

    for (const event of events) {
      switch (event.wrangled.name) {
        case 'MarketCreated': {
          const { args } = event.wrangled;
          marketCreates.push({
            profileId: Number(args.profileId),
            creatorAddress: args.creator,
            positivePrice: '0',
            negativePrice: '0',
            trustVotes: 0,
            distrustVotes: 0,
            basePrice: args.config.basePrice.toString(),
            creationCost: args.config.creationCost.toString(),
          });
          marketProfileIds.add(Number(args.profileId));
          break;
        }
        case 'MarketUpdated': {
          const { args } = event.wrangled;
          marketUpdateEventCreates.push({
            eventId: event.id,
            marketProfileId: Number(args.profileId),
            positivePrice: args.trustPrice.toString(),
            negativePrice: args.distrustPrice.toString(),
            deltaVoteTrust: Number(args.deltaVoteTrust),
            deltaVoteDistrust: Number(args.deltaVoteDistrust),
            deltaPositivePrice: args.deltaTrustPrice.toString(),
            deltaNegativePrice: args.deltaDistrustPrice.toString(),
            blockNumber: Number(args.blockNumber),
            createdAt: getDateFromUnix(args.updatedAt),
          });
          marketUpdates.push({
            data: {
              positivePrice: args.trustPrice.toString(),
              negativePrice: args.distrustPrice.toString(),
              trustVotes: Number(args.voteTrust),
              distrustVotes: Number(args.voteDistrust),
            },
            where: { profileId: Number(args.profileId) },
          });

          marketPriceEventCreates.push({
            marketProfileId: Number(args.profileId),
            trustPrice: args.trustPrice.toString(),
            distrustPrice: args.distrustPrice.toString(),
            deltaTrustPrice: args.deltaTrustPrice.toString(),
            deltaDistrustPrice: args.deltaDistrustPrice.toString(),
          });
          marketProfileIds.add(Number(args.profileId));
          break;
        }
        case 'VotesBought': {
          const { args } = event.wrangled;
          marketVoteEventCreates.push({
            eventId: event.id,
            type: 'BUY',
            actorAddress: args.buyer,
            isPositive: args.isPositive,
            amount: Number(args.amount),
            funds: args.funds.toString(),
            marketProfileId: Number(args.profileId),
            createdAt: getDateFromUnix(args.boughtAt),
          });

          marketProfileIds.add(Number(args.profileId));
          break;
        }
        case 'VotesSold': {
          const { args } = event.wrangled;
          marketVoteEventCreates.push({
            eventId: event.id,
            type: 'SELL',
            actorAddress: args.seller,
            isPositive: args.isPositive,
            amount: Number(args.amount),
            funds: args.funds.toString(),
            marketProfileId: Number(args.profileId),
            createdAt: getDateFromUnix(args.soldAt),
          });

          marketProfileIds.add(Number(args.profileId));
          break;
        }
      }
    }

    const marketVoteStatCreates: PrismaTimescale.MarketVotesCreateManyInput[] =
      marketVoteEventCreates.map((event) => ({
        marketProfileId: event.marketProfileId,
        createdAt: event.createdAt,
        voteType: event.isPositive ? 'TRUST' : 'DISTRUST',
        eventType: event.type,
        amount: event.amount,
        funds: event.funds,
      }));

    return {
      payload: {
        marketCreates: Array.from(marketCreates.values()),
        marketUpdates,
        marketPriceEventCreates,
        marketUpdateEventCreates,
        marketVoteEventCreates,
        marketVoteStatCreates,
        marketProfileIds,
      },
      dirtyScoreTargets: [], // Reputation markets do not affect scores.
    };
  },
  submitPayload: async (
    {
      marketCreates,
      marketUpdates,
      marketUpdateEventCreates,
      marketVoteEventCreates,
      marketVoteStatCreates,
      marketPriceEventCreates,
      marketProfileIds,
    },
    logger,
  ) => {
    await prismaPostgres.$transaction([
      prismaPostgres.market.createMany({ data: marketCreates }),
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      ...marketUpdates.map((x) => prismaPostgres.market.updateMany(x)),
      prismaPostgres.marketUpdatedEvent.createMany({ data: marketUpdateEventCreates }),
      prismaPostgres.marketVoteEvent.createMany({ data: marketVoteEventCreates }),
    ]);

    await prismaTimescale.$transaction([
      prismaTimescale.marketPrices.createMany({ data: marketPriceEventCreates }),
      prismaTimescale.marketVotes.createMany({ data: marketVoteStatCreates }),
    ]);

    MarketData.updateMarketStats(Array.from(marketProfileIds)).catch((err) => {
      logger.error({ err }, 'market_stat_update_error');
    });
  },
};
