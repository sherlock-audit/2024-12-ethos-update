import { css } from '@emotion/react';
import { useCopyToClipboard } from '@ethos/common-ui';
import { Flex, Typography } from 'antd';
import { ActionButton } from 'app/(exp)/_components/action-button.component';
import { AwardIcon } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { getReferralUrl } from 'utils/claim';
import { useScoreCategory } from 'utils/scoreCategory';
import { xComHelpers } from 'utils/tweets';

const styles = {
  container: css({
    padding: tokenCssVars.paddingLG,
  }),
  icon: css({
    color: tokenCssVars.colorPrimary,
    fontSize: '50px',
  }),
  title: css({
    textAlign: 'center',
  }),
  text: css({
    textAlign: 'center',
    fontSize: '14px',
    lineHeight: '22px',
  }),
  shareButton: css({
    color: tokenCssVars.colorPrimary,
    backgroundColor: tokenCssVars.colorBgLayout,
  }),
};

type Props = {
  twitterUserId: string;
  score: number;
  initialBonus: number;
};

export function ShareReferral({ twitterUserId, score, initialBonus }: Props) {
  const shareableUrl = getReferralUrl(twitterUserId);
  const copyToClipboard = useCopyToClipboard();

  const [{ status }] = useScoreCategory(score);

  return (
    <Flex vertical align="center" justify="center" gap={tokenCssVars.margin} css={styles.container}>
      <AwardIcon css={styles.icon} />
      <Typography.Title level={3} css={styles.title}>
        Get more contributor XP
      </Typography.Title>
      <Typography.Text css={styles.text}>
        Earn 20% of the XP of those who accept your invite.
        <br />
        They will also get a 20% boost.
      </Typography.Text>
      <Flex vertical gap={4}>
        <ActionButton
          type="default"
          onClick={() => {
            const url = xComHelpers.shareClaimReferralTweetUrl(
              initialBonus,
              score,
              status,
              shareableUrl,
            );

            window.open(url, '_blank');
          }}
          css={styles.shareButton}
        >
          Share referral link
        </ActionButton>
        <ActionButton
          type="text"
          onClick={() => {
            copyToClipboard(shareableUrl, 'Shareable link copied');
          }}
        >
          Copy shareable link
        </ActionButton>
      </Flex>
    </Flex>
  );
}
