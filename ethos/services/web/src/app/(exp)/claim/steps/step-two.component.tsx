import { css } from '@emotion/react';
import { Flex, theme, Typography } from 'antd';
import { CentredBackgroundImage } from '../../_components/centred-background-image.component';
import { claimDescription, claimTitle } from '../styles/typography';
import { tokenCssVars } from 'config/theme';

export function StepTwo() {
  const { token } = theme.useToken();

  return (
    <Flex
      align="center"
      justify="center"
      css={css({
        position: 'relative',
        background: tokenCssVars.colorBgContainer,
        height: tokenCssVars.fullHeight,
        padding: `${token.paddingMD}px`,
      })}
    >
      <CentredBackgroundImage image="/assets/images/exp-claim/horse-logo.svg" imageSize="350px" />
      <Flex
        vertical
        gap={token.marginSM}
        justify="center"
        css={css({
          zIndex: 1,
        })}
      >
        <Typography.Title level={2} css={claimTitle}>
          Crypto is stuck in
          <br />
          the Wild West.
        </Typography.Title>
        <Typography.Text css={claimDescription}>
          Fraud & scams dominate. <br /> Zero accountability. <br /> We’re changing that, onchain.
        </Typography.Text>
      </Flex>
    </Flex>
  );
}
