import { ThumbsDownFilledSvg, ThumbsUpFilledSvg } from '~/components/icons/thumbs.tsx';
import { darkTheme } from '~/config/theme.ts';

const voteTypeToColor = {
  trust: darkTheme.token.colorTrust,
  distrust: darkTheme.token.colorDistrust,
};

export function VotePercentageOG({
  percentage,
  voteType,
}: {
  percentage: number;
  voteType: 'trust' | 'distrust';
}) {
  return (
    <div
      tw="flex items-center text-8xl leading-none"
      style={{
        gap: '24px',
        fontFamily: 'Queens',
        color: voteTypeToColor[voteType],
      }}
    >
      <span tw="text-6xl leading-none">
        {voteType === 'trust' ? <ThumbsUpFilledSvg /> : <ThumbsDownFilledSvg />}
      </span>
      <span>{percentage}%</span>
      <span>{voteType}</span>
    </div>
  );
}
