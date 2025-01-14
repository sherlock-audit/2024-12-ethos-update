import { css, Global } from '@emotion/react';
import { Flex, theme, Typography } from 'antd';
import { FlexArrow } from '../../_components/flex-arrow.component';
import { ProfileAvatar } from '../../_components/profile-avatar.component';
import { claimDescription, claimTitle } from '../styles/typography';
import { ReviewFilled } from 'components/icons';
import { tokenCssVars } from 'config/theme';

const styles = {
  global: css({
    body: {
      backgroundColor: '#2f3035 !important',
    },
  }),
  container: css({
    height: tokenCssVars.fullHeight,
    padding: `${tokenCssVars.paddingXL} ${tokenCssVars.paddingLG}`,
  }),
  text: css({
    color: tokenCssVars.colorBgContainer,
  }),
  subTitle: css({
    fontSize: '21px',
    lineHeight: '32px',
  }),
  review: css({
    position: 'relative',
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    padding: tokenCssVars.paddingMD,
    backgroundColor: tokenCssVars.colorTextBase,
  }),
  reviewIcons: css({
    fontSize: '36px',
    color: tokenCssVars.colorSuccess,
  }),
  reviewText: css({
    width: 'max-content',
    position: 'absolute',
    transform: 'translate(50%)',
    top: '120%',
    right: '50%',
    '& span': {
      fontSize: '18px',
    },
  }),
};

export function StepThree() {
  const { token } = theme.useToken();

  return (
    <>
      <Global styles={styles.global} />
      <Flex vertical justify="center" align="center" gap={token.marginMD} css={styles.container}>
        <Flex vertical align="center" gap={6} css={{ marginTop: -20 }}>
          <Typography.Title level={2} css={[claimTitle, styles.text]}>
            We believe
          </Typography.Title>
          <Typography.Text css={[claimDescription, styles.text, styles.subTitle]}>
            That we need social <br />
            signals to determine credibility.
          </Typography.Text>
        </Flex>
        <Flex align="center" justify="center" gap={1}>
          <ProfileAvatar
            size={96}
            scoreSize={200}
            avatarUrl="/assets/images/exp-claim/avatar1.png"
            score={1503}
            expImpactValue={12}
            showBorder
          />
          <FlexArrow width={40} size={1} />
          <Flex justify="center" align="center" css={styles.review}>
            <ReviewFilled css={styles.reviewIcons} />
            <div css={styles.reviewText}>
              <Typography.Text css={styles.text}>positive review</Typography.Text>
            </div>
          </Flex>
          <FlexArrow width={40} size={1} />
          <ProfileAvatar
            size={96}
            scoreSize={200}
            avatarUrl="/assets/images/exp-claim/avatar2.png"
            score={1403}
            scoreImpactValue={32}
            showBorder
          />
        </Flex>
      </Flex>
    </>
  );
}
