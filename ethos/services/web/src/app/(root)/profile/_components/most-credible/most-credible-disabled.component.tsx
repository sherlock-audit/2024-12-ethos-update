import { css } from '@emotion/react';
import { Button, Card, Flex, Typography } from 'antd';
import Link from 'next/link';
import { CustomPopover } from 'components/custom-popover/custom-popover.component';
import { CheckWindow, PersonOff } from 'components/icons';
import { tokenCssVars } from 'config/theme';

const { Text } = Typography;

const styles = {
  card: css({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  container: css({
    height: '100%',
  }),
  icon: css({
    color: tokenCssVars.colorTextSecondary,
    fontSize: '32px',
    opacity: 0.65,
  }),
  text: css({
    width: '80%',
    textAlign: 'center',
    lineHeight: tokenCssVars.lineHeightSM,
    color: tokenCssVars.colorTextSecondary,
  }),
  claimLink: css({
    color: tokenCssVars.colorPrimary,
    lineHeight: tokenCssVars.lineHeightLG,
    textAlign: 'center',
  }),
};

export function MostCredibleVouchersPlug() {
  return (
    <Card css={styles.card}>
      <Flex css={styles.container} gap={11} vertical align="center" justify="center">
        <PersonOff css={styles.icon} />
        <Text css={styles.text}>
          This account has not been connected to an Ethos profile. Click below to vote that you
          would like to see this account connected.
        </Text>
        <CustomPopover
          title="Coming soon"
          content="Voting on profiles to join Ethos will be coming soon."
          trigger="click"
        >
          <Button icon={<CheckWindow />}>Vote</Button>
        </CustomPopover>
        <Link href="/claimed" css={styles.claimLink}>
          Is this you?
          <br />
          Check your claim.
        </Link>
      </Flex>
    </Card>
  );
}
