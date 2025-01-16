import { css } from '@emotion/react';
import { Flex, Tag, Typography } from 'antd';
import { claimDescription, claimTitle } from '../styles/typography';
import { ScorePieChart } from 'app/(root)/profile/[address]/score/_components/score-pie-chart.component';
import { scoreRangeData } from 'app/(root)/profile/[address]/score/_components/score-ranges';
import { Logo } from 'components/icons';
import { tokenCssVars } from 'config/theme';

const styles = {
  container: css({
    height: tokenCssVars.fullHeight,
    background: tokenCssVars.colorBgContainer,
    padding: tokenCssVars.padding,
  }),
  strikethrough: css({
    textDecoration: 'line-through',
  }),
  tag: css({
    backgroundColor: tokenCssVars.colorBgLayout,
    padding: `${tokenCssVars.paddingXXS} ${tokenCssVars.paddingLG}`,
  }),
  tagTitle: css({
    color: tokenCssVars.colorPrimary,
  }),
  tagLogo: css({
    fontSize: '66%',
  }),
  chartContainer: css({
    width: '100%',
    height: '200px',
    marginBottom: '24px',
    minWidth: '300px',
  }),
};

export function StepFour() {
  const STATIC_SCORE = 1700;

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={tokenCssVars.marginMD}
      css={styles.container}
    >
      <div css={styles.chartContainer}>
        <ScorePieChart
          data={scoreRangeData.map((item) => ({ ...item, totalScore: STATIC_SCORE }))}
          totalScore={STATIC_SCORE}
        />
      </div>

      <Flex vertical align="center" gap={6}>
        <Typography.Title level={2} css={claimTitle}>
          We inform
        </Typography.Title>
        <Typography.Text css={claimDescription}>
          who can be trusted and who <span css={styles.strikethrough}>can&apos;t</span>
          <br />
          through the Ethos credibility score.
        </Typography.Text>
      </Flex>

      <Tag bordered={false} color="default" css={styles.tag}>
        <Flex vertical align="center" gap={0}>
          <Typography.Title css={styles.tagTitle}>
            <Flex justify="center" gap={tokenCssVars.marginXXS}>
              {STATIC_SCORE} <Logo css={styles.tagLogo} />
            </Flex>
          </Typography.Title>
          <Typography.Title level={4} css={styles.tagTitle}>
            Reputable
          </Typography.Title>
        </Flex>
      </Tag>
    </Flex>
  );
}
