import { type PaginatedResponse, type PaginatedQuery, isValidAddress } from '@ethos/helpers';
import { Prisma } from '@prisma-pg/client';
import { type Address, getAddress } from 'viem';
import { prisma } from '../db.js';

const marketPriceHistoryData = Prisma.validator<Prisma.MarketUpdatedEventDefaultArgs>()({
  select: {
    positivePrice: true,
    negativePrice: true,
    createdAt: true,
  },
});
type MarketPriceHistoryItem = Prisma.MarketUpdatedEventGetPayload<typeof marketPriceHistoryData>;

export type PrismaMarketInfo = Prisma.MarketGetPayload<{
  include: {
    profile: false;
  };
}>;

export type PrismaMarketTransaction = Prisma.MarketVoteEventGetPayload<{
  include: {
    market: false;
    event: true;
  };
}>;

export type PrismaMarketPriceHistory = Prisma.MarketUpdatedEventGetPayload<{
  select: {
    positivePrice: true;
    negativePrice: true;
    createdAt: true;
  };
  include: {
    market: false;
  };
}>;

export async function getMarketInfo(profileId: number): Promise<PrismaMarketInfo | null> {
  return await prisma.market.findUnique({
    where: {
      profileId,
    },
  });
}

export async function getAllMarkets(): Promise<PrismaMarketInfo[]> {
  return await prisma.market.findMany();
}

export async function getMarketsByIds(ids: number[]): Promise<PrismaMarketInfo[]> {
  return await prisma.market.findMany({
    where: {
      profileId: { in: ids },
    },
  });
}

export async function getMarketPriceHistory(
  profileId: number,
  sinceTime: Date,
): Promise<MarketPriceHistoryItem[]> {
  return await prisma.marketUpdatedEvent.findMany({
    select: {
      positivePrice: true,
      negativePrice: true,
      createdAt: true,
    },
    where: {
      marketProfileId: profileId,
      createdAt: {
        gt: sinceTime,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function getTransactions({
  profileId,
  voteTypeFilter,
  limit,
  offset,
  actorAddress,
}: {
  profileId?: number;
  voteTypeFilter: 'trust' | 'distrust' | 'all';
  actorAddress?: Address;
} & PaginatedQuery): Promise<PaginatedResponse<PrismaMarketTransaction>> {
  const where = {
    ...(profileId ? { marketProfileId: profileId } : {}),
    ...(isValidAddress(actorAddress) ? { actorAddress } : {}),
    ...(voteTypeFilter !== 'all' ? { isPositive: voteTypeFilter === 'trust' } : {}),
  };

  const [count, values] = await Promise.all([
    prisma.marketVoteEvent.count({ where }),
    prisma.marketVoteEvent.findMany({
      where,
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
  ]);

  return {
    values,
    total: count,
    limit,
    offset,
  };
}

type GetMarketHoldersResult = Array<{
  actorAddress: string;
  isPositive: boolean;
  total_amount: bigint;
}>;

export async function getMarketHolders(profileId: number): Promise<GetMarketHoldersResult> {
  const result = await prisma.$queryRaw<GetMarketHoldersResult>`
    SELECT
      "actorAddress",
      "isPositive",
      SUM(
        CASE
          WHEN type = 'BUY' THEN amount
          WHEN type = 'SELL' THEN -amount
        END
      ) AS total_amount
    FROM
      market_vote_events
    WHERE
      "marketProfileId" = ${profileId}
    GROUP BY
      "actorAddress",
      "isPositive"
    HAVING
      SUM(
        CASE
          WHEN type = 'BUY' THEN amount
          WHEN type = 'SELL' THEN -amount
        END
      ) <> 0
    ORDER BY "isPositive" DESC, "total_amount" DESC
  `;

  return result;
}

export async function getMarketParticipants(profileId: number): Promise<Address[]> {
  const result = await prisma.marketVoteEvent.findMany({
    where: {
      marketProfileId: profileId,
    },
    select: {
      actorAddress: true,
    },
    distinct: ['actorAddress'],
  });

  return result.map((r) => getAddress(r.actorAddress));
}

function holdingsByAddressCTE(address: Address): Prisma.Sql {
  return Prisma.sql`
    WITH holdings AS (
      SELECT
        mve."actorAddress",
        CASE
          WHEN mve."isPositive" THEN 'trust'
        ELSE 'distrust'
      END as "voteType",
      mve."marketProfileId",
      SUM(
        CASE
          WHEN mve.type = 'BUY' THEN mve.amount
          WHEN mve.type = 'SELL' THEN -mve.amount
        END
      ) AS total_amount
    FROM
      market_vote_events mve
    WHERE
      mve."actorAddress" = ${address}
    GROUP BY
      mve."actorAddress",
      mve."isPositive",
      mve."marketProfileId"
    HAVING
      SUM(
        CASE
          WHEN mve.type = 'BUY' THEN mve.amount
          WHEN mve.type = 'SELL' THEN -mve.amount
        END
      ) <> 0
  )
`;
}

export type GetHoldingsByAddressResult = Array<{
  actorAddress: string;
  voteType: 'trust' | 'distrust';
  marketProfileId: number;
  totalAmount: bigint;
  trustPrice: string;
  distrustPrice: string;
}>;

export async function getHoldingsByAddress(
  address: Address,
  { limit, offset }: PaginatedQuery,
): Promise<GetHoldingsByAddressResult> {
  const result = await prisma.$queryRaw<GetHoldingsByAddressResult>`
    ${holdingsByAddressCTE(address)}
    SELECT
      h."actorAddress",
      h."voteType",
      h."marketProfileId",
      h.total_amount as "totalAmount",
      m."positivePrice" as "trustPrice",
      m."negativePrice" as "distrustPrice"
    FROM
      holdings h
    JOIN
      markets m ON h."marketProfileId" = m."profileId"
    ORDER BY h."voteType" DESC, h.total_amount DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return result;
}

export type GetHoldingsTotalByAddressResult = { total_value: string | null };

export async function getHoldingsTotalByAddress(
  address: Address,
): Promise<GetHoldingsTotalByAddressResult> {
  const result = await prisma.$queryRaw<[GetHoldingsTotalByAddressResult]>`
    ${holdingsByAddressCTE(address)}
    SELECT
      SUM(
        CASE
          WHEN h."voteType" = 'trust' THEN h.total_amount * CAST(m."positivePrice" AS NUMERIC)
          ELSE h.total_amount * CAST(m."negativePrice" AS NUMERIC)
        END
      ) AS total_value
    FROM
      holdings h
    JOIN
      markets m ON h."marketProfileId" = m."profileId"
  `;

  return result[0];
}

export type GetTradingVolumeByAddressResult = {
  totalVolume: number;
};

export async function getTradingVolumeByAddress(
  address: Address,
): Promise<GetTradingVolumeByAddressResult> {
  const transactions = await prisma.marketVoteEvent.aggregate({
    where: {
      actorAddress: address,
    },
    _sum: {
      amount: true,
    },
  });

  return {
    totalVolume: transactions._sum.amount ?? 0,
  };
}

/**
 * Denormalizes aggregate stats for a market for simpler read queries.
 * Calculates and updates:
 * - Total trading volume
 * - 24hr trading volume
 * - Price changes over 24hrs
 * - Market cap
 *
 * @param profileIds - Array of market profile IDs to update
 */
export async function updateMarketStats(profileIds: number[]): Promise<void> {
  await prisma.$executeRaw`
    WITH volume_totals AS (
      SELECT
          "marketProfileId",
          SUM(CAST(funds AS numeric)) AS total_volume,
          SUM(CAST(funds AS numeric)) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '24 HOURS') AS volume_24hr
      FROM market_vote_events
      WHERE "marketProfileId" = ANY(ARRAY[${profileIds.join(',')}]::integer[])
      GROUP BY "marketProfileId"
    ),
    price_changes AS (
        SELECT
            "marketProfileId",
            (
                SELECT CAST("positivePrice" AS numeric)
                FROM market_events
                WHERE "marketProfileId" = me."marketProfileId"
                  AND "createdAt" < NOW() - INTERVAL '24 HOURS'
                ORDER BY "createdAt" DESC
                LIMIT 1
            ) AS price_before_24hr,
            (
                SELECT CAST("positivePrice" AS numeric)
                FROM market_events
                WHERE "marketProfileId" = me."marketProfileId"
                ORDER BY "createdAt" DESC
                LIMIT 1
            ) AS latest_price
        FROM market_events me
        WHERE "marketProfileId" = ANY(ARRAY[${profileIds.join(',')}]::integer[])
        GROUP BY "marketProfileId"
    ),
    market_caps AS (
        SELECT
            "marketProfileId",
            SUM(
                CASE
                    WHEN type = 'BUY' THEN CAST(funds AS numeric)
                    WHEN type = 'SELL' THEN -CAST(funds AS numeric)
                    ELSE 0
                END
            ) AS market_cap
        FROM market_vote_events
        WHERE "marketProfileId" = ANY(ARRAY[${profileIds.join(',')}]::integer[])
        GROUP BY "marketProfileId"
    ),
    updates AS (
        SELECT
            markets."profileId",
            COALESCE(volume_totals.total_volume, '0')::text AS total_volume,
            COALESCE(volume_totals.volume_24hr, '0')::text AS volume_24hr,
            COALESCE(
                CASE
                    WHEN price_changes.price_before_24hr IS NOT NULL AND price_changes.latest_price IS NOT NULL THEN
                        ((price_changes.latest_price - price_changes.price_before_24hr) / price_changes.price_before_24hr) * 100
                    ELSE 0
                END,
                0
            ) AS price_change_24hr,
            COALESCE(market_caps.market_cap, 0)::text AS market_cap
        FROM markets
        LEFT JOIN volume_totals ON markets."profileId" = volume_totals."marketProfileId"
        LEFT JOIN price_changes ON markets."profileId" = price_changes."marketProfileId"
        LEFT JOIN market_caps ON markets."profileId" = market_caps."marketProfileId"
        WHERE markets."profileId" = ANY(ARRAY[${profileIds.join(',')}]::integer[])
    )

    UPDATE markets
    SET
        "volumeTotalWei" = updates.total_volume,
        "volume24hrWei" = updates.volume_24hr,
        "priceChange24hrPercent" = updates.price_change_24hr,
        "marketCapWei" = updates.market_cap
    FROM updates
    WHERE markets."profileId" = updates."profileId";`;
}
