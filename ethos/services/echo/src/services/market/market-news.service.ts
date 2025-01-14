import { X_SERVICE } from '@ethos/domain';
import { duration, JsonHelper } from '@ethos/helpers';
import { type z } from 'zod';
import { rootLogger } from '../../common/logger.js';
import { metrics } from '../../common/metrics.js';
import { TwitterOfficial } from '../../common/net/twitter/twitter-official.client.js';
import { type UserTweet } from '../../common/net/twitter/twitter-official.type.js';
import { prisma } from '../../data/db.js';
import { MarketData } from '../../data/market/index.js';
import { redis } from '../../data/redis.js';
import { Service } from '../service.base.js';
import { type AnyRecord } from '../service.types.js';
import { validators } from '../service.validator.js';

const TWEET_CACHE_TTL = duration(24, 'hours').toSeconds();
const logger = rootLogger.child({ service: 'market-news' });

const popularTweetCacheOperationsCounter = metrics.makeCounter({
  name: 'popular_tweet_cache_operations',
  help: 'Count of twitter popular tweet cache operations (hits and misses)',
  labelNames: ['operation'],
});

const schema = validators.profileId.array();

type Input = z.infer<typeof schema>;
type Output = Array<{
  marketProfileId: number;
  tweet: TwitterNewsItem | null;
}>;

type TwitterNewsItem = {
  id: string;
  text: string;
  createdAt: Date;
  url: string;
  retweets: number;
  likes: number;
  replies: number;
  impressions: number;
};

export class MarketNewsService extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute(params: Input): Promise<Output> {
    if (params.length === 0) {
      return [];
    }

    const marketProfileIds = await MarketData.getMarketsByIds(params).then((markets) =>
      markets.map((market) => market.profileId),
    );
    const attestations = await prisma.attestation.findMany({
      where: {
        profileId: { in: marketProfileIds },
        service: X_SERVICE,
        archived: false,
      },
    });

    const tweets = await Promise.all(
      attestations.map(async (attestation) => await getRandomPopularTweet(attestation.account)),
    );

    return attestations.map((attestation, index) => ({
      marketProfileId: attestation.profileId,
      tweet: tweets[index],
    }));
  }
}

/**
 * Get a random popular tweet from a user's tweets.
 * If the tweet is older than 1 week, replace the cache with new tweets and return a random tweet from those.
 * @param twitterUserId - The Twitter user ID.
 * @returns A random popular tweet from the user's tweets.
 */
async function getRandomPopularTweet(twitterUserId: string): Promise<TwitterNewsItem | null> {
  const cachedTweets = await getCachedTweets(twitterUserId);

  // If the tweet is older than 1 week, replace the cache with a new set of popular tweets
  // and return a random tweet from those.
  if (cachedTweets.length) {
    logger.info({ twitterUserId }, 'market_popular_tweet_cache_hit');

    return pickRandom(cachedTweets);
  }

  logger.info({ twitterUserId }, 'market_popular_tweet_cache_miss');
  // If nothing was cached or the cached tweet is old, check for popular tweets again.
  const twitter = new TwitterOfficial();
  try {
    const freshTweets = await twitter.getUserTweets({ twitterUserId });
    const popularTweets = pickPopularTweets(freshTweets?.data).map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      createdAt: new Date(tweet.created_at),
      likes: tweet.public_metrics.like_count,
      retweets: tweet.public_metrics.retweet_count,
      replies: tweet.public_metrics.reply_count,
      impressions: tweet.public_metrics.impression_count,
      url: `https://x.com/${tweet.author_id}/status/${tweet.id}`,
    }));

    await cacheTweets(twitterUserId, popularTweets);

    return pickRandom(popularTweets);
  } catch (err) {
    logger.error({ err }, 'market_popular_tweet_error');

    return null;
  }
}

const WEIGHTS = {
  retweet: 4,
  reply: 3,
  like: 2,
  impression: 0.01,
};
function pickPopularTweets(tweets?: UserTweet[]): UserTweet[] {
  if (!tweets?.length) {
    return [];
  }

  const tweetsWithScore = tweets.map((tweet) => {
    const score =
      tweet.public_metrics.retweet_count * WEIGHTS.retweet +
      tweet.public_metrics.reply_count * WEIGHTS.reply +
      tweet.public_metrics.like_count * WEIGHTS.like +
      tweet.public_metrics.impression_count * WEIGHTS.impression;

    return {
      tweet,
      score,
    };
  });

  return tweetsWithScore
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((t) => t.tweet);
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) {
    return null;
  }

  return arr[Math.floor(Math.random() * arr.length)];
}

function cachedTweetsKey(twitterUserId: string): string {
  return `market:${twitterUserId}:tweets`;
}

async function getCachedTweets(twitterUserId: string): Promise<TwitterNewsItem[]> {
  const cachedTweets = await redis.get(cachedTweetsKey(twitterUserId));

  if (!cachedTweets) {
    popularTweetCacheOperationsCounter.inc({ operation: 'miss' });

    return [];
  }

  popularTweetCacheOperationsCounter.inc({ operation: 'hit' });
  const cachedTweetsParsed = JsonHelper.parseSafe<TwitterNewsItem[]>(cachedTweets, {
    reviver: JsonHelper.reviver,
  });

  return cachedTweetsParsed ?? [];
}

async function cacheTweets(twitterUserId: string, tweets: TwitterNewsItem[]): Promise<void> {
  await redis.setex(cachedTweetsKey(twitterUserId), TWEET_CACHE_TTL, JSON.stringify(tweets));
}
