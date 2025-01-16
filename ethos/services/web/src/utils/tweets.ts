import { ethosTwitterHandle, ethosTwitterHashtag } from '@ethos/domain';
import { capitalize, formatXPScore, generateIntentTweetUrl } from '@ethos/helpers';
import { type ScoreLevel } from '@ethos/score';

function shareReviewTweetUrl(
  activityUrl: string,
  reviewType: 'negative' | 'neutral' | 'positive',
  twitterHandle: string,
): string {
  const safeHandle = twitterHandle ? ` for ${twitterHandle}` : '';

  return generateIntentTweetUrl(
    [
      `I just left a ${reviewType} review${safeHandle} on ${ethosTwitterHandle}`,
      `${activityUrl} ${ethosTwitterHashtag}`,
    ].join('\n\n'),
  );
}

function shareVouchTweetUrl(
  activityUrl: string,
  vouchAmount: string,
  twitterHandle: string,
): string {
  const safeHandle = twitterHandle ? ` for ${twitterHandle}` : '';

  return generateIntentTweetUrl(
    [
      `I just vouched ${vouchAmount} ${safeHandle} on ${ethosTwitterHandle}`,
      `${activityUrl} ${ethosTwitterHashtag}`,
    ].join('\n\n'),
  );
}

function shareProfileTweetUrl(url: string, twitterHandle: string): string {
  return generateIntentTweetUrl(
    [`Check out ${twitterHandle}'s ${ethosTwitterHandle} profile.`, url].join('\n\n'),
  );
}

function shareClaimReferralTweetUrl(
  xpAmount: number,
  score: number,
  scoreLevel: ScoreLevel,
  referralUrl: string,
) {
  return generateIntentTweetUrl(
    [
      `I just claimed ${formatXPScore(xpAmount)} contributor XP on ${ethosTwitterHandle} to help bring reputation and credibility onchain.`,
      `I got an initial credibility score of "${score} - ${capitalize(scoreLevel)}"`,
      `Use my ref link to go see how reputable you are and we both get 20% more XP\n${referralUrl}`,
    ].join('\n\n'),
  );
}

export const xComHelpers = {
  shareReviewTweetUrl,
  shareVouchTweetUrl,
  shareProfileTweetUrl,
  shareClaimReferralTweetUrl,
};
