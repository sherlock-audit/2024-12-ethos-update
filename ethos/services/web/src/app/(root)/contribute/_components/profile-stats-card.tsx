'use client';

import { css } from '@emotion/react';
import { type ActivityActor } from '@ethos/domain';
import { formatXPScore } from '@ethos/helpers';
import { Card, Flex, Typography } from 'antd';
import Link from 'next/link';
import { ContributionStreaks } from '../../_feed-features/contributor-mode/contributor-cta/contribution-streaks';
import { UserAvatar } from 'components/avatar/avatar.component';
import { EthosStar } from 'components/icons';
import { PersonName } from 'components/person-name/person-name.component';
import { tokenCssVars } from 'config/theme';

const styles = {
  flexContainer: css({
    minWidth: 0,
    flex: 1,
  }),
  rankText: css({
    color: tokenCssVars.orange7,
  }),
  leaderboardLink: css({
    color: tokenCssVars.colorPrimary,
  }),
  xpTitle: css({
    textAlign: 'right',
  }),
  star: css({
    fontSize: '32px',
    color: tokenCssVars.orange7,
  }),
  streakMultiplier: css({
    textAlign: 'right',
  }),
} as const;

type ProfileStatsCardProps = {
  actor: ActivityActor;
  rank: number;
  streakDays: number;
  totalXp: number;
  streakMultiplier: number;
};

export function ProfileStatsCard({
  actor,
  rank,
  streakDays,
  totalXp,
  streakMultiplier,
}: ProfileStatsCardProps) {
  return (
    <Card bordered={false}>
      <Flex vertical gap={12}>
        <Flex justify="space-between" align="top" gap={12}>
          <Flex justify="left" align="top" gap={12} css={styles.flexContainer}>
            <UserAvatar size={48} actor={actor} />
            <Flex css={styles.flexContainer} vertical gap={4}>
              <PersonName size="large" target={actor} ellipsis />
              <Typography.Text css={styles.rankText}>
                <b>{rank > 0 ? `Rank #${rank}` : 'Not ranked'}</b>
              </Typography.Text>
              <Typography.Text>
                <Link css={styles.leaderboardLink} href="/leaderboard">
                  View full leaderboard
                </Link>
              </Typography.Text>
            </Flex>
          </Flex>
          <Flex justify="right" align="top" gap={12}>
            <Flex vertical gap={6}>
              <Typography.Title level={1} css={styles.xpTitle}>
                {formatXPScore(totalXp)} <EthosStar css={styles.star} />
              </Typography.Title>
              <Typography.Title level={5} css={styles.streakMultiplier}>
                {streakMultiplier}x streak multiplier
              </Typography.Title>
            </Flex>
          </Flex>
        </Flex>
        <Flex justify="space-between" align="center">
          <Typography.Title level={3}>
            {streakDays >= 1 ? `${streakDays} day streak` : 'No active streak'}
          </Typography.Title>
          <ContributionStreaks currentStreakDay={streakDays} showLabels={false} />
        </Flex>
      </Flex>
    </Card>
  );
}
