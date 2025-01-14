'use client';

import { css } from '@emotion/react';
import { type ScoreLevel } from '@ethos/score';
import { Card, Flex, Typography, theme } from 'antd';
import { Logo } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { getColorFromScoreLevel } from 'utils/score';

const { useToken } = theme;

const styles = {
  card: css({
    position: 'relative',
  }),
  cardBody: {
    paddingBlock: 25,
  },
  multiplierCircle: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    fontSize: '12px',
    color: tokenCssVars.colorText,
    outline: '2px solid',
    outlineOffset: '2px',
    position: 'relative',
    background: 'transparent',
  }),
  currentMultiplierCircle: css({
    outline: '3px solid',
  }),
  logo: css({
    fontSize: '40px',
    color: tokenCssVars.colorPrimary,
  }),
  title: css({
    color: tokenCssVars.colorPrimary,
    whiteSpace: 'wrap',
    letterSpacing: '0.48px',
    textAlign: 'center',
  }),
  description: css({
    textAlign: 'center',
    maxWidth: 120,
  }),
  multiplierContainer: css({
    width: '100%',
    justifyContent: 'center',
    '& > *': {
      flex: '0 0 auto',
    },
  }),
  spacer: css({
    width: '52px',
  }),
} as const;

type IncreaseScoreCardProps = {
  currentLevel: ScoreLevel;
  currentMultiplier: number;
  nextLevel: ScoreLevel | null;
  nextMultiplier: number | null;
  prevLevel: ScoreLevel | null;
  prevMultiplier: number | null;
};

export function IncreaseScoreCard({
  currentLevel,
  currentMultiplier,
  nextLevel,
  nextMultiplier,
  prevLevel,
  prevMultiplier,
}: IncreaseScoreCardProps) {
  const { token } = useToken();

  return (
    <Card
      bordered={false}
      css={styles.card}
      styles={{
        body: styles.cardBody,
      }}
    >
      <Flex vertical align="center" gap={14}>
        <Flex vertical align="center" gap={4}>
          <Logo css={styles.logo} />
          <Typography.Title level={3} css={styles.title}>
            Increase your score.
          </Typography.Title>
          <Flex vertical align="center" justify="center" gap={2} css={styles.description}>
            <Typography.Text>Higher Ethos scores get higher multipliers to all XP</Typography.Text>
          </Flex>
        </Flex>
        <Flex wrap align="center" gap="small" css={styles.multiplierContainer}>
          {prevLevel && prevMultiplier ? (
            <>
              <div
                css={[
                  styles.multiplierCircle,
                  { outlineColor: getColorFromScoreLevel(prevLevel, token) },
                ]}
              >
                {prevMultiplier}x
              </div>
              <span>←</span>
            </>
          ) : (
            <div css={styles.spacer} />
          )}

          <div
            css={[
              styles.multiplierCircle,
              styles.currentMultiplierCircle,
              { outlineColor: getColorFromScoreLevel(currentLevel, token) },
            ]}
          >
            <b>{currentMultiplier}x</b>
          </div>

          {nextLevel && nextMultiplier ? (
            <>
              <span>→</span>
              <div
                css={[
                  styles.multiplierCircle,
                  { outlineColor: getColorFromScoreLevel(nextLevel, token) },
                ]}
              >
                {nextMultiplier}x
              </div>
            </>
          ) : (
            <div css={styles.spacer} />
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
