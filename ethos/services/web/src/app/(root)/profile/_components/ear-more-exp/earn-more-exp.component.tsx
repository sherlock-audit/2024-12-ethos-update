import { css } from '@emotion/react';
import { Button, Card, Flex, theme, Typography } from 'antd';
import { tokenCssVars } from 'config/theme';
import { ethosDiscordLink } from 'constant/links';

const styles = {
  title: css({
    color: tokenCssVars.colorBgContainer,
  }),
  joinDiscordButton: css({
    border: 0,
  }),
};

export function EarnMoreExp() {
  const { token } = theme.useToken();

  return (
    <Card
      css={css({
        height: '100%',
        boxShadow: tokenCssVars.boxShadowTertiary,
        background: tokenCssVars.colorText,
        '.ant-card-body': {
          padding: '20px',
          [`@media (min-width: ${token.screenMD}px)`]: {
            padding: '30px',
          },
        },
      })}
    >
      <Flex
        gap={token.marginMD}
        align="center"
        justify="space-between"
        css={css({
          height: '100%',
          [`@media (max-width: ${token.screenMD}px)`]: {
            flexDirection: 'column',
          },
        })}
      >
        <Typography.Title level={3} css={styles.title}>
          Ready to earn more XP? You’ll need an invite first.
        </Typography.Title>

        <Button href={ethosDiscordLink} target="_blank" size="large" css={styles.joinDiscordButton}>
          Join Discord community
        </Button>
      </Flex>
    </Card>
  );
}
