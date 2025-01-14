import { css } from '@emotion/react';
import { formatXPScore } from '@ethos/helpers';
import { Card, Flex, Typography } from 'antd';
import Link from 'next/link';
import { ProfileAvatar } from 'app/(exp)/_components/profile-avatar.component';
import { ArrowUpScoreIcon, EthosStar } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { type useAcceptedReferrals } from 'hooks/api/echo.hooks';

const styles = {
  card: css({
    width: '100%',
    maxWidth: '400px',
    backgroundColor: tokenCssVars.colorBgElevated,
  }),
  scoreIcon: css({
    color: tokenCssVars.colorSuccess,
    fontSize: '120%',
  }),
  starIcon: css({
    fontSize: '86%',
    color: tokenCssVars.orange7,
  }),
};

type AcceptedReferralCardProps = {
  referral: NonNullable<ReturnType<typeof useAcceptedReferrals>['data']>['values'][number];
};

export function AcceptedReferralCard({
  referral: { actor, bonusAmountForSender },
}: AcceptedReferralCardProps) {
  return (
    <Card css={styles.card}>
      <Flex gap={tokenCssVars.marginSM} justify="space-between" align="center">
        <Flex gap={tokenCssVars.marginSM} align="center">
          <ProfileAvatar size="default" avatarUrl={actor.avatar} score={actor.score} />
          <Flex vertical gap={2}>
            <Link href={`https://x.com/${actor.username}`} target="_blank" rel="noreferrer">
              <Typography.Text>{actor.name}</Typography.Text>
            </Link>
            <Typography.Text type="secondary">Earned you</Typography.Text>
          </Flex>
        </Flex>
        <Flex gap={tokenCssVars.marginXXS}>
          <Typography.Text type="secondary">
            <Flex align="center" gap={tokenCssVars.marginXS}>
              <ArrowUpScoreIcon css={styles.scoreIcon} />
              {formatXPScore(bonusAmountForSender)}
              <span css={styles.starIcon}>
                <EthosStar />
              </span>
            </Flex>
          </Typography.Text>
        </Flex>
      </Flex>
    </Card>
  );
}
