import { webUrlMap } from '@ethos/env';
import { convertScoreToLevel } from '@ethos/score';
import { Link } from '@remix-run/react';
import { Avatar, Card, Flex, Tooltip, Typography } from 'antd';
import { EthosLogoIcon } from '~/components/icons/ethos-logo.tsx';
import { EthosReviewIcon } from '~/components/icons/ethos-review.tsx';
import { EthosVouchIcon } from '~/components/icons/ethos-vouch.tsx';
import { ExternalLinkIcon } from '~/components/icons/external-link.tsx';
import { TooltipIconWrapper } from '~/components/tooltip/tooltip-icon-wrapper.tsx';
import { useEnvironment } from '~/hooks/env.tsx';
import { type Market, type EthosProfileStats } from '~/types/markets.ts';
import { getColorBgClassFromScore } from '~/utils/score.utils.ts';

export function EthosProfileInfo({
  market,
  ethosProfileStats,
}: {
  market: Market;
  ethosProfileStats: EthosProfileStats;
}) {
  const scoreLabel = convertScoreToLevel(market.ethosScore ?? 0);
  const bgColorClassName = getColorBgClassFromScore(market.ethosScore ?? 0);
  const env = useEnvironment();
  const profileLink = market.twitterUsername
    ? `${webUrlMap[env]}/profile/x/${market.twitterUsername}`
    : `${webUrlMap[env]}/profile/${market.address}`;

  const {
    positiveReviewPercentage,
    receivedReviewsCount,
    vouchedAmountInEthFormatted,
    vouchedAmountInUsdFormatted,
  } = ethosProfileStats;

  return (
    <Card className="h-full">
      <Flex gap={12}>
        <Avatar
          src={<EthosLogoIcon className="text-antd-colorBgLayout" />}
          size={60}
          shape="circle"
          className={bgColorClassName}
        />
        <Flex vertical gap={4}>
          <Link
            to={profileLink}
            target="_blank"
            rel="noreferrer"
            className="text-xs flex items-center gap-1 text-antd-colorText"
          >
            <ExternalLinkIcon className="text-sm" />
            Ethos profile
          </Link>
          <Typography.Text className="font-semibold capitalize text-sm">
            {market.ethosScore} • {scoreLabel}
          </Typography.Text>
          <Flex gap={12} align="center" className="min-w-0">
            <EthosProfileInfoStat
              tooltip="Reviews"
              icon={<EthosReviewIcon className="text-base/none" />}
              value={
                receivedReviewsCount > 0 ? (
                  <Tooltip title={`${receivedReviewsCount} reviews`}>
                    {positiveReviewPercentage.toFixed(0)}% positive
                  </Tooltip>
                ) : (
                  <>No reviews</>
                )
              }
            />
            <EthosProfileInfoStat
              tooltip="Vouches"
              icon={<EthosVouchIcon className="text-base/none" />}
              value={
                vouchedAmountInEthFormatted ? (
                  <Tooltip
                    title={
                      vouchedAmountInUsdFormatted
                        ? `${vouchedAmountInUsdFormatted} vouched`
                        : undefined
                    }
                  >
                    {vouchedAmountInEthFormatted} vouched
                  </Tooltip>
                ) : (
                  <>No vouches</>
                )
              }
            />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}

function EthosProfileInfoStat({
  tooltip,
  icon,
  value,
}: {
  tooltip: string;
  icon: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <Typography.Text className="flex items-center gap-1 text-xs" type="secondary" ellipsis>
      <Tooltip title={tooltip}>
        <TooltipIconWrapper className="text-base">{icon}</TooltipIconWrapper>
      </Tooltip>
      {value}
    </Typography.Text>
  );
}
