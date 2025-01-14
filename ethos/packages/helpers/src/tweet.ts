export function generateIntentTweetUrl(tweetContent: string): string {
  const searchParams = new URLSearchParams({ text: tweetContent });

  return `https://twitter.com/intent/tweet?${searchParams.toString()}`;
}
