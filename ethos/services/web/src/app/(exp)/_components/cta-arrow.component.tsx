import { css, keyframes } from '@emotion/react';
import { type EthosTheme } from '@ethos/common-ui';
import { Typography, Flex } from 'antd';

import { ArrowDownThinIcon } from 'components/icons';
import { tokenCssVars } from 'config/theme';

const bounceAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
`;

const styles = {
  light: css({
    color: tokenCssVars.colorTextSecondary,
  }),
  dark: css({
    color: tokenCssVars.colorBgContainer,
  }),
  container: css({
    position: 'absolute',
    bottom: 50,
    fontSize: 20,
  }),
  title: css({
    color: 'inherit',
    fontSize: 14,
  }),
  icon: css({
    animation: `${bounceAnimation} 1.5s ease-in-out infinite`,
  }),
};

export function CtaArrow({ theme, text }: { theme: EthosTheme; text?: string }) {
  return (
    <Flex vertical justify="center" align="center" gap={12} css={[styles.container, styles[theme]]}>
      {text && <Typography.Text css={styles.title}>{text}</Typography.Text>}
      <ArrowDownThinIcon css={styles.icon} />
    </Flex>
  );
}
