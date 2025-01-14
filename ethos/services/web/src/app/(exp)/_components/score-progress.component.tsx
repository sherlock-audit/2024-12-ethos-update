import { css } from '@emotion/react';
import { useIsMobile } from '@ethos/common-ui';
import { capitalize } from '@ethos/helpers';
import { scoreRanges, type ScoreLevel } from '@ethos/score';
import { theme, Flex, Tooltip, Typography } from 'antd';
import { getColorFromScoreLevel } from 'utils/score';

const levels = Object.keys(scoreRanges) as Array<keyof typeof scoreRanges>;

const styles = {
  container: css({
    marginTop: 4,
    marginBottom: 20,
  }),
  dot: css({
    position: 'relative',
    borderRadius: '50%',
  }),
  dotSm: css({
    width: '11px',
    height: '11px',
  }),
  dotLg: css({
    width: '14px',
    height: '14px',
  }),
  dotText: css({
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    textTransform: 'capitalize',
  }),
  dotTextSm: css({
    fontSize: 12,
  }),
  dotTextLg: css({
    fontSize: 14,
  }),
  line: css({
    flex: 1,
    height: '3px',
    minWidth: '16px',
    backgroundColor: '#B7B6AD',
  }),
  scoreLevel: css({
    display: 'contents',
  }),
};

export function ScoreProgress({ level }: { level: ScoreLevel }) {
  const { token } = theme.useToken();
  const isMobile = useIsMobile();
  const marginInline = isMobile ? 16 : 20;

  return (
    <Flex
      gap={isMobile ? 12 : 16}
      align="center"
      css={[
        styles.container,
        {
          paddingInline: marginInline,
          width: `calc(100% - ${marginInline * 2}px)`,
        },
      ]}
    >
      {levels.map((scoreLevel, index) => {
        const isLast = index === levels.length - 1;
        const isActive = scoreLevel === level;

        return (
          <div key={scoreLevel} css={styles.scoreLevel}>
            <Tooltip title={isActive ? 'Current level' : capitalize(scoreLevel)} placement="top">
              <div
                css={[
                  styles.dot,
                  isActive ? styles.dotLg : styles.dotSm,
                  { backgroundColor: getColorFromScoreLevel(scoreLevel, token) },
                ]}
              >
                {isActive && (
                  <Typography.Text
                    css={[
                      styles.dotText,
                      isActive ? styles.dotTextLg : styles.dotTextSm,
                      {
                        color: getColorFromScoreLevel(scoreLevel, token),
                      },
                    ]}
                  >
                    {scoreLevel}
                  </Typography.Text>
                )}
              </div>
            </Tooltip>
            {!isLast && <div css={styles.line} />}
          </div>
        );
      })}
    </Flex>
  );
}
