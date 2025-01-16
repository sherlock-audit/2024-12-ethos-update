import { NetError } from '@ethos/helpers';
import { config } from '../../config.js';
import { getClientSummaryMetric } from '../client-metrics.js';
import { type UserTweetResponse, type SearchTweetResponse } from './twitter-official.type.js';

const summary = getClientSummaryMetric('twitter_official');

export class TwitterOfficial {
  async searchTweets({
    query,
    maxResults = 10,
    sortOrder = 'recency',
  }: {
    query: {
      from?: string;
      keywords: string[];
    };
    maxResults?: number;
    sortOrder?: 'relevancy' | 'recency';
  }): Promise<SearchTweetResponse> {
    const searchParams = new URLSearchParams({
      query: [query.from && `from:${query.from}`, ...query.keywords.map((k) => `"${k}"`)].join(' '),
      'tweet.fields': ['author_id', 'created_at', 'entities'].join(','),
      max_results: String(maxResults),
      sort_order: sortOrder,
    });

    return await this.fetch<SearchTweetResponse>(
      'searchTweets',
      `/2/tweets/search/recent?${searchParams.toString()}`,
    );
  }

  async getUserTweets({
    twitterUserId,
    maxResults = 10,
  }: {
    twitterUserId: string;
    maxResults?: number;
  }): Promise<UserTweetResponse> {
    const searchParams = new URLSearchParams({
      'tweet.fields': ['author_id', 'created_at', 'public_metrics'].join(','),
      exclude: ['retweets', 'replies'].join(','),
      max_results: String(maxResults),
    });

    return await this.fetch<UserTweetResponse>(
      'getUserTweets',
      `/2/users/${twitterUserId}/tweets?${searchParams.toString()}`,
    );
  }

  private async fetch<R>(
    methodName: string,
    pathname: string,
    { headers, ...options }: RequestInit = {},
  ): Promise<R> {
    const startTime = Date.now();

    const url = new URL(pathname, 'https://api.twitter.com');

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      ...options,
    });

    const isJSON = response.headers.get('Content-Type')?.includes('application/json');

    const body = isJSON ? await response.json() : await response.text();

    summary
      .labels({
        method_name: methodName,
        http_method: options.method ?? 'GET',
        response_code: response.status,
      })
      .observe(Date.now() - startTime);

    if (response.status > 399) {
      throw new NetError(`${response.status}: ${response.statusText}`, {
        status: response.status,
        body,
      });
    }

    return body as R;
  }
}
