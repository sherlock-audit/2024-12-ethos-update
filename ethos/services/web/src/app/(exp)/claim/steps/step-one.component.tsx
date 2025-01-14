import { css } from '@emotion/react';
import { Flex, Typography } from 'antd';
import { CentredBackgroundImage } from '../../_components/centred-background-image.component';
import { claimTitle } from '../styles/typography';
import { CtaArrow } from 'app/(exp)/_components/cta-arrow.component';
import { tokenCssVars } from 'config/theme';

const styles = {
  container: css({
    height: tokenCssVars.fullHeight,
    position: 'relative',
    padding: '50px 0',
    backgroundColor: tokenCssVars.colorPrimary,
    color: tokenCssVars.colorWhite,
    overflow: 'hidden',
  }),
};

export function StepOne() {
  return (
    <Flex justify="center" align="center" css={styles.container}>
      <CentredBackgroundImage image="/assets/images/logo.svg" imageSize="350px" opacity={0.2} />
      <Typography.Title
        level={1}
        css={[
          claimTitle,
          {
            color: tokenCssVars.colorBgElevated,
          },
        ]}
      >
        gm.
        <br />
        we’re ethos.
      </Typography.Title>
      <CtaArrow theme="dark" />
    </Flex>
  );
}
