import { TrophyFilled } from '@ant-design/icons';
import { css } from '@emotion/react';
import { Logo, LogoFullSvg } from '@ethos/common-ui';
import { formatXPScore } from '@ethos/helpers';
import { convertScoreToLevel } from '@ethos/score';
import { Flex, theme, Typography } from 'antd';
import { ValueCard } from '../_components/value-card.component';
import { CtaArrow } from 'app/(exp)/_components/cta-arrow.component';
import { ProfileAvatar } from 'app/(exp)/_components/profile-avatar.component';
import { ScoreProgress } from 'app/(exp)/_components/score-progress.component';
import { ContributorWingLeftSvg } from 'app/(root)/_feed-features/contributor-mode/illustration/contributor-wing-left.svg';
import { EthosStar } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { type useActor } from 'hooks/user/activities';
import { getColorFromScoreLevel } from 'utils/score';

const styles = {
  container: css({
    height: tokenCssVars.fullHeight,
    minHeight: 800,
    position: 'relative',
    padding: '50px 0',
    backgroundColor: tokenCssVars.colorBgLayout,
    color: tokenCssVars.colorWhite,
    overflow: 'hidden',
  }),
  logo: css({
    color: tokenCssVars.colorTextBase,
  }),
  body: css({
    position: 'relative',
    width: '400px',
    maxWidth: '100%',
  }),
  bgWing: css({
    fontSize: '48px',
    color: tokenCssVars.colorText,
    position: 'absolute',
    pointerEvents: 'none',
    top: '25px',
    opacity: 0.08,
  }),
  header: {
    container: css({
      zIndex: 1,
    }),
    iconContainer: css({
      position: 'relative',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      padding: tokenCssVars.paddingMD,
      backgroundColor: tokenCssVars.colorBgContainer,
    }),
    icon: css({
      fontSize: '25px',
      color: tokenCssVars.colorPrimary,
    }),
    title: css({
      textAlign: 'center',
    }),
    name: css({
      textAlign: 'center',
      fontSize: '14px',
    }),
    avatar: css({
      transform: 'translateY(50%)',
    }),
  },
  stats: css({
    width: '100%',
    paddingInline: tokenCssVars.marginXL,
  }),
};

export function StepOne({
  claimAmount,
  twitterUser,
}: {
  claimAmount: number;
  twitterUser: ReturnType<typeof useActor>;
}) {
  const { token } = theme.useToken();
  const scoreLevel = convertScoreToLevel(twitterUser.score);

  return (
    <Flex vertical gap={tokenCssVars.marginXXL} align="center" css={styles.container}>
      <span css={styles.logo}>
        <LogoFullSvg />
      </span>
      <div css={styles.body}>
        <ContributorWingLeftSvg
          css={css([
            styles.bgWing,
            css({
              left: 'calc(50% - 150px)',
              [`@media (min-width: ${token.screenMD}px)`]: {
                left: 'max(3%, 10px)',
              },
            }),
          ])}
        />
        <ContributorWingLeftSvg
          css={css([
            styles.bgWing,
            css({
              right: 'calc(50% - 150px)',
              transform: 'scaleX(-1)', // flip horizontally
              [`@media (min-width: ${token.screenMD}px)`]: {
                right: 'max(3%, 10px)',
              },
            }),
          ])}
        />

        <Flex
          vertical
          gap={tokenCssVars.marginXXS}
          justify="center"
          align="center"
          css={styles.header.container}
        >
          <Flex justify="center" align="center" css={styles.header.iconContainer}>
            <TrophyFilled css={styles.header.icon} />
          </Flex>
          <Typography.Title level={2} css={styles.header.title}>
            Congrats!
          </Typography.Title>
          <Typography.Text css={styles.header.name}>{twitterUser.name}</Typography.Text>
          <div css={styles.header.avatar}>
            <ProfileAvatar avatarUrl={twitterUser.avatar} />
          </div>
        </Flex>
      </div>

      <Flex vertical align="center" gap={tokenCssVars.margin} css={styles.stats}>
        <ValueCard
          title="Claimed contributor XP"
          value={formatXPScore(claimAmount)}
          valueColor={tokenCssVars.orange8}
          icon={<EthosStar />}
        />
        <ValueCard
          title="Your starting credibility score"
          value={twitterUser.score}
          valueColor={getColorFromScoreLevel(scoreLevel, token)}
          icon={<Logo />}
          extra={<ScoreProgress level={scoreLevel} />}
        />
      </Flex>
      <CtaArrow theme="light" text="Want to earn more?" />
    </Flex>
  );
}
