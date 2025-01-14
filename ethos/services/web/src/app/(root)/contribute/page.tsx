'use client';

import { css } from '@emotion/react';
import {
  streakDaysToMultiplier,
  ANSWER_XP,
  VOTE_XP,
  REVIEW_XP,
  BASE_VOUCH_DAY_XP_GAIN,
  INVITE_ACCEPTED_XP_GAIN,
  BASE_REVIEW_XP_GAIN,
} from '@ethos/domain';
import { convertScoreToLevel, scoreLevelXpMultiplier, type ScoreLevel } from '@ethos/score';
import { Card, Col, Flex, Row, Typography } from 'antd';
import { getContributorState } from '../_feed-features/contributor-mode/contributor-cta/getContributorDetails';
import {
  useInteractWithContributorMode,
  useInvalidateContributionQueries,
} from '../_feed-features/contributor-mode/contributor-cta/hooks';
import { ContributeCard } from './_components/contribute-card';
import { IncreaseScoreCard } from './_components/increase-score-card';
import { ProfileStatsCard } from './_components/profile-stats-card';
import { XpItem } from './_components/xp-item';
import { AuthRequiredWrapper } from 'components/auth/auth-required-wrapper.component';
import { useCurrentUser } from 'contexts/current-user.context';
import { useThemeMode } from 'contexts/theme-manager.context';
import { useContributionStats, useXpLeaderboard } from 'hooks/api/echo.hooks';
import { useActor } from 'hooks/user/activities';

const styles = {
  title: css({
    marginTop: '18px',
    marginBottom: '16px',
  }),
  marginTop16: css({
    marginTop: '16px',
  }),
  marginBottom16: css({
    marginBottom: '16px',
  }),
  waysToEarnTitle: css({
    marginBottom: '16px',
  }),
  moreWaysToEarnTitle: css({
    marginBottom: '16px',
  }),
} as const;

export default function Page() {
  const { connectedProfile } = useCurrentUser();
  const target = { profileId: connectedProfile?.id ?? 0 };
  const { data: stats } = useContributionStats(target);
  const mode = useThemeMode();
  const { data: leaderboard = [] } = useXpLeaderboard();
  const actor = useActor(target);
  const multiplier = streakDaysToMultiplier(stats?.streakDaysOptimistic ?? 0);
  const onInteract = useInteractWithContributorMode();
  const invalidateQueries = useInvalidateContributionQueries();

  const currentLevel = convertScoreToLevel(actor.score);
  const levels = Object.keys(scoreLevelXpMultiplier).reverse() as ScoreLevel[];
  const currentLevelIndex = levels.indexOf(currentLevel);
  const prevLevel = currentLevelIndex > 0 ? levels[currentLevelIndex - 1] : null;
  const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;

  const rank = leaderboard.findIndex((profile) => profile.userkey === actor.userkey) + 1;

  const { buttonText, status } = getContributorState({
    stats: stats ?? {
      canGenerateDailyContributions: true,
      resetTimestamp: 0,
      totalCount: 0,
      completedCount: 0,
      skippedCount: 0,
      pendingCount: 0,
      pendingBundleCount: 0,
      todayXp: 0,
      pendingXp: 0,
      totalXp: 0,
      previousXpLookup: {},
      previousBundleXpLookup: {},
      streakDays: 0,
      streakDaysOptimistic: 0,
    },
    onTimeout: invalidateQueries,
    mode,
  });

  return (
    <AuthRequiredWrapper>
      <Row css={styles.marginTop16}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 22, offset: 1 }}
          md={{ span: 16, offset: 4 }}
          lg={{ span: 14, offset: 5 }}
        >
          <Typography.Title level={2} css={styles.title}>
            Contribute to Ethos
          </Typography.Title>
        </Col>
      </Row>
      <Row gutter={[23, 28]}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 22, offset: 1 }}
          md={{ span: 16, offset: 4 }}
          lg={{ span: 14, offset: 5 }}
        >
          {connectedProfile && (
            <ProfileStatsCard
              actor={actor}
              rank={rank}
              streakDays={stats?.streakDaysOptimistic ?? 0}
              totalXp={stats?.totalXp ?? 0}
              streakMultiplier={multiplier}
            />
          )}
        </Col>
      </Row>
      <Row gutter={[23, 28]} css={styles.marginTop16}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 22, offset: 1 }}
          md={{ span: 16, offset: 4 }}
          lg={{ span: 14, offset: 5 }}
        >
          <Typography.Title level={3} css={styles.waysToEarnTitle}>
            Ways to earn XP
          </Typography.Title>
        </Col>
      </Row>
      <Row gutter={[23, 28]}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 11, offset: 1 }}
          md={{ span: 8, offset: 4 }}
          lg={{ span: 7, offset: 5 }}
        >
          <ContributeCard buttonText={buttonText} status={status} onInteract={onInteract} />
        </Col>
        <Col xs={{ span: 24 }} sm={{ span: 11 }} md={{ span: 8 }} lg={{ span: 7 }}>
          <IncreaseScoreCard
            currentLevel={currentLevel}
            currentMultiplier={actor.scoreXpMultiplier}
            nextLevel={nextLevel}
            nextMultiplier={nextLevel ? scoreLevelXpMultiplier[nextLevel] : null}
            prevLevel={prevLevel}
            prevMultiplier={prevLevel ? scoreLevelXpMultiplier[prevLevel] : null}
          />
        </Col>
      </Row>
      <Row gutter={[23, 28]} css={styles.marginTop16}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 22, offset: 1 }}
          md={{ span: 16, offset: 4 }}
          lg={{ span: 14, offset: 5 }}
        >
          <Typography.Title level={4} css={styles.moreWaysToEarnTitle}>
            More ways to earn
          </Typography.Title>
        </Col>
      </Row>
      <Row gutter={[23, 28]}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 22, offset: 1 }}
          md={{ span: 16, offset: 4 }}
          lg={{ span: 14, offset: 5 }}
        >
          <Card bordered={false}>
            <Flex vertical gap="middle">
              <XpItem label="Write a review" xp={BASE_REVIEW_XP_GAIN} />
              <XpItem label="Vouch for users" xp={BASE_VOUCH_DAY_XP_GAIN} unit="/ 1e / day" />
              <XpItem label="Reciprocated vouches for you" xp="2x multiplier" unit="/ 1e / day" />
              <XpItem label="A user accepts your invite" xp={INVITE_ACCEPTED_XP_GAIN} />
              <XpItem label="Answer questions (Daily contribution)" xp={ANSWER_XP} />
              <XpItem label="Write reviews (Daily contribution)" xp={REVIEW_XP} />
              <XpItem label="Vote on reviews (Daily contribution)" xp={VOTE_XP} />
            </Flex>
          </Card>
        </Col>
      </Row>
    </AuthRequiredWrapper>
  );
}
