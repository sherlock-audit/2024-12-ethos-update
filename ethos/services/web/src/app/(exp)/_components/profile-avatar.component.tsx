import { css } from '@emotion/react';
import { Avatar, Flex } from 'antd';
import { type AvatarSize } from 'antd/es/avatar/AvatarContext';
import { ExpImpactDisplay, ScoreImpactDisplay } from './value-impact-display.component';
import { Score } from 'components/avatar/score.component';

type AvatarProps = {
  avatarUrl?: string | null;
  size?: AvatarSize;
  score?: number;
  scoreSize?: AvatarSize;
  scoreImpactValue?: number;
  expImpactValue?: number;
  showBorder?: boolean;
};

const styles = {
  container: css({
    position: 'relative',
  }),
  border: css({
    border: '2px solid var(--ant-color-text-base)',
    borderRadius: '50%',
  }),
  avatarWrapper: css({
    height: 'fit-content',
    position: 'relative',
  }),
  bottomContainer: css({
    position: 'absolute',
    transform: 'translate(50%)',
    top: '120%',
    right: '50%',
  }),
};

export function ProfileAvatar({
  avatarUrl,
  size,
  score,
  scoreSize,
  scoreImpactValue,
  expImpactValue,
  showBorder,
}: AvatarProps) {
  return (
    <Flex
      vertical
      gap={12}
      justify="center"
      css={css([styles.container, showBorder && styles.border])}
    >
      <div css={styles.avatarWrapper}>
        <Avatar size={size} src={avatarUrl} />
        {score !== undefined && <Score size={scoreSize} score={score} />}
      </div>
      <div css={styles.bottomContainer}>
        {scoreImpactValue !== undefined && (
          <ScoreImpactDisplay value={scoreImpactValue} size="large" />
        )}
        {expImpactValue !== undefined && <ExpImpactDisplay value={expImpactValue} size="large" />}
      </div>
    </Flex>
  );
}
