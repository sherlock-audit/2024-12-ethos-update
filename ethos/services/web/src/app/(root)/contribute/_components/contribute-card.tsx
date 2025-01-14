'use client';

import { css } from '@emotion/react';
import { Badge, Button, Card, Flex, Typography, theme } from 'antd';
import { type ReactNode } from 'react';
import { ContributorWingLeftSvg } from '../../_feed-features/contributor-mode/illustration/contributor-wing-left.svg';
import { HandshakeIcon } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { useThemeMode } from 'contexts/theme-manager.context';

const styles = {
  bgWing: css({
    fontSize: 48,
    color: tokenCssVars.colorText,
    position: 'absolute',
    pointerEvents: 'none',
    top: 25,
    opacity: 0.08,
  }),
  contributeButton: (mode: 'light' | 'dark') =>
    css({
      padding: 16,
      borderRadius: 6,
      color: tokenCssVars.colorBgContainer,
      '&[data-status="completed"]': {
        backgroundColor: mode === 'light' ? '#bdbdb6' : '#44443F',
        color: tokenCssVars.colorText,
        minWidth: 88,
      },
    }),
  contributeTitle: css({
    color: tokenCssVars.colorPrimary,
    whiteSpace: 'wrap',
    letterSpacing: '0.48px',
  }),
  contributeText: css({
    textAlign: 'center',
    maxWidth: 120,
  }),
  ribbonText: css({
    color: tokenCssVars.colorBgContainer,
    fontWeight: 400,
  }),
  card: css({
    position: 'relative',
  }),
  cardBody: {
    paddingBlock: 25,
  },
  icon: css({
    fontSize: '40px',
    color: tokenCssVars.colorPrimary,
  }),
};

type ContributeCardProps = {
  buttonText: ReactNode;
  status: string;
  onInteract: () => void;
};

export function ContributeCard({ buttonText, status, onInteract }: ContributeCardProps) {
  const mode = useThemeMode();
  const { token } = theme.useToken();

  return (
    <Badge.Ribbon text={<Typography.Text css={styles.ribbonText}>New</Typography.Text>}>
      <Card bordered={false} css={styles.card} styles={{ body: styles.cardBody }}>
        <ContributorWingLeftSvg
          css={css`
            ${styles.bgWing}
            left: calc(50% - 150px);
            @media (min-width: ${token.screenMD}px) {
              left: max(3%, 10px);
            }
            @media (min-width: ${token.screenSM}px) {
              left: max(4%, 10px);
            }
          `}
        />
        <ContributorWingLeftSvg
          css={css`
            ${styles.bgWing}
            right: calc(50% - 150px);
            transform: scaleX(-1); // flip horizontally
            @media (min-width: ${token.screenMD}px) {
              right: max(3%, 10px);
            }
            @media (min-width: ${token.screenSM}px) {
              right: max(4%, 10px);
            }
          `}
        />
        <Flex vertical align="center" gap={14}>
          <Flex vertical align="center" gap={4}>
            <HandshakeIcon css={styles.icon} />
            <Typography.Title level={3} css={styles.contributeTitle}>
              Contribute.
            </Typography.Title>
            <Flex vertical align="center" justify="center" gap={2} css={styles.contributeText}>
              <Typography.Text>
                Write reviews & vote on them to earn Contributor XP daily
              </Typography.Text>
            </Flex>
          </Flex>
          <Button
            type={status === 'completed' ? 'default' : 'primary'}
            css={styles.contributeButton(mode)}
            data-status={status}
            onClick={onInteract}
          >
            {buttonText}
          </Button>
        </Flex>
      </Card>
    </Badge.Ribbon>
  );
}
