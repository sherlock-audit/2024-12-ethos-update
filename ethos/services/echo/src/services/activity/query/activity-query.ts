import { type ActivityInfo } from '@ethos/domain';
import { Prisma } from '@prisma-pg/client';
import { type Address } from 'viem';
import { type z } from 'zod';
import { blockchainManager } from '../../../common/blockchain-manager.js';
import { prisma } from '../../../data/db.js';
import { type sharedFilterSchema, queryCount } from '../utility.js';

type Input = {
  data: {
    query: Prisma.Sql;
    id: Prisma.Sql;
    timestamp: Prisma.Sql;
    authorProfileId: Prisma.Sql;
    contract: Address | null;
  };
  orderBy: z.infer<typeof sharedFilterSchema>['orderBy'];
  currentUserProfileId: z.infer<typeof sharedFilterSchema>['currentUserProfileId'];
  minimumAuthorScore: z.infer<typeof sharedFilterSchema>['minimumAuthorScore'];
  pagination: {
    limit: number;
    offset: number;
  };
};

export type ActivityQueryOutput<T> = Array<{
  data: T;
  metadata: ActivityMetadata;
}>;

export type ActivityMetadata = {
  timestamp: Date;
  votes: ActivityInfo['votes'];
  replySummary: ActivityInfo['replySummary'];
  sortWeight: number;
};

const ORDER_BY_DIRECTION_MAP: Record<Input['orderBy']['direction'], Prisma.Sql> = {
  asc: Prisma.sql`ASC`,
  desc: Prisma.sql`DESC`,
};

const ORDER_BY_BUILDER_MAP: Record<Input['orderBy']['field'], (input: Input) => Prisma.Sql> = {
  timestamp: (input) => Prisma.sql`EXTRACT(EPOCH FROM data.${input.data.timestamp})`,
  // https://www.evanmiller.org/how-not-to-sort-by-average-rating.html
  votes: () => {
    return Prisma.sql`
      CASE WHEN (upvotes + downvotes) > 0
      THEN
        ((upvotes + 1.9208) / (upvotes + downvotes) -
        1.96 * SQRT((upvotes * downvotes) / (upvotes + downvotes) + 0.9604) /
        (upvotes + downvotes)) / (1 + 3.8416 / (upvotes + downvotes))
      ELSE
        0
      END`;
  },
  // https://github.com/reddit-archive/reddit/blob/753b17407e9a9dca09558526805922de24133d53/r2/r2/lib/db/_sorts.pyx#L60
  controversial: () => {
    const magnitude = Prisma.sql`(upvotes + downvotes)`;
    const balance = Prisma.sql`(CASE WHEN upvotes > downvotes THEN downvotes / upvotes ELSE upvotes / downvotes END)`;

    return Prisma.sql`CASE WHEN ${magnitude} > 0 THEN POWER(${magnitude}, ${balance}) ELSE 0 END`;
  },
};

export async function activityQuery<T>(
  input: Input,
): Promise<{ results: ActivityQueryOutput<T>; totalCount: number }> {
  const sortWeight = ORDER_BY_BUILDER_MAP[input.orderBy.field](input);

  const where =
    input.minimumAuthorScore === undefined
      ? Prisma.empty
      : Prisma.sql`WHERE author_scores.score >= ${input.minimumAuthorScore}`;

  const sql = Prisma.sql`
    WITH RECURSIVE
    data AS (
      ${input.data.query}
    ),
    vote_info AS (
      SELECT
        "targetContract",
        "targetId",
        COUNT(*) FILTER (WHERE "isUpvote" = true) as upvotes,
        COUNT(*) FILTER (WHERE "isUpvote" = false) as downvotes
      FROM votes
      GROUP BY "targetContract", "targetId"
    ),
    reply_hierarchy AS (
      -- base case
      SELECT
        replies.id,
        replies."parentId",
        replies."targetContract",
        replies."authorProfileId",
        replies."parentId" AS "rootParentId",
        replies."targetContract" AS "rootContract"
      FROM replies
      INNER JOIN data ON
        replies."parentId" = data.${input.data.id} AND
        replies."targetContract" = ${input.data.contract}

      UNION

      -- recursive query
      SELECT
        child.id,
        child."parentId",
        child."targetContract",
        child."authorProfileId",
        reply_hierarchy."rootParentId" AS "rootParentId",
        reply_hierarchy."rootContract" AS "rootContract"
      FROM replies AS child
      INNER JOIN reply_hierarchy ON
        reply_hierarchy.id = child."parentId" AND
        child."targetContract" = ${blockchainManager.getContractAddress('discussion')}
      ),
    reply_summary AS (
      SELECT
        "rootParentId" AS "parentId",
        "rootContract" AS "targetContract",
        COUNT(*) as total_reply_count,
        COUNT(*) FILTER (WHERE "authorProfileId" = ${input.currentUserProfileId}) as current_user_reply_count,
        COUNT(*) FILTER (WHERE "rootParentId" = "parentId" AND "rootContract" = "targetContract") as root_reply_count
      FROM reply_hierarchy
      GROUP BY "rootParentId", "rootContract"
    ),
    author_scores AS (
      SELECT DISTINCT ON (target)
        target,
        score
      FROM score_history
      ORDER BY target, "createdAt" DESC
    )

    SELECT
      COALESCE(vote_info.upvotes, 0) AS upvotes,
      COALESCE(vote_info.downvotes, 0) AS downvotes,
      reply_summary.root_reply_count AS "replyCount",
      COALESCE(reply_summary.current_user_reply_count > 0, false) AS participated,
      data.${input.data.timestamp} AS timestamp,
      ${sortWeight} as "sortWeight",
      data.*
    FROM data
    LEFT JOIN vote_info ON
      vote_info."targetContract" = ${input.data.contract} AND
      vote_info."targetId" = data.${input.data.id}
    LEFT JOIN reply_summary ON
      reply_summary."parentId" = data.${input.data.id} AND
      reply_summary."targetContract" = ${input.data.contract}
    LEFT JOIN author_scores ON target = FORMAT('profileId:%s', data.${input.data.authorProfileId})
    ${where}
    ORDER BY "sortWeight" ${ORDER_BY_DIRECTION_MAP[input.orderBy.direction]}
    OFFSET ${input.pagination.offset}
    LIMIT ${input.pagination.limit}
  `;

  type Result = T & {
    upvotes: bigint;
    downvotes: bigint;
    replyCount: bigint;
    participated: boolean;
    authorScore: number;
    timestamp: Date;
    sortWeight: number;
  };

  const rows = await prisma.$queryRaw<Result[]>(sql);

  const results: ActivityQueryOutput<T> = [];

  for (const {
    upvotes,
    downvotes,
    replyCount,
    participated,
    timestamp,
    sortWeight,
    authorScore,
    ...data
  } of rows) {
    results.push({
      data: data as T,
      metadata: {
        timestamp,
        votes: {
          upvotes: Number(upvotes),
          downvotes: Number(downvotes),
        },
        replySummary: {
          count: Number(replyCount),
          participated,
        },
        sortWeight,
      },
    });
  }

  const countSql = Prisma.sql`
    WITH
    data AS (
      ${input.data.query}
    ),
    author_scores AS (
      SELECT DISTINCT ON (target)
        target,
        score
      FROM score_history
      ORDER BY target, "createdAt" DESC
    )

    SELECT COUNT(*)
    FROM data
    LEFT JOIN author_scores ON target = FORMAT('profileId:%s', data.${input.data.authorProfileId})
    ${where}
  `;

  const totalCount = await queryCount(countSql);

  return { results, totalCount };
}
