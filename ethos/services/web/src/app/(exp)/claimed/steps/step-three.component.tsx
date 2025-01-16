import { css } from '@emotion/react';
import { X_SERVICE } from '@ethos/domain';
import { Flex, Typography } from 'antd';
import Link from 'next/link';
import { ActionButton } from 'app/(exp)/_components/action-button.component';
import { Logo } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { type useActor } from 'hooks/user/activities';
import { useRouteTo } from 'hooks/user/hooks';

const styles = {
  container: css({
    backgroundColor: tokenCssVars.colorPrimary,
    minHeight: tokenCssVars.fullHeight,
    padding: tokenCssVars.padding,
  }),
  logo: css({
    color: tokenCssVars.colorBgElevated,
    fontSize: '40px',
  }),
  title: css({
    color: tokenCssVars.colorBgElevated,
    textAlign: 'center',
  }),
};

export function StepThree({
  twitterUser,
  twitterUserId,
}: {
  twitterUser: ReturnType<typeof useActor>;
  twitterUserId: string;
}) {
  const { data: routTo } = useRouteTo({
    service: X_SERVICE,
    ...(twitterUser.username ? { username: twitterUser.username } : { account: twitterUserId }),
  });

  return (
    <Flex vertical align="center" justify="center" gap={tokenCssVars.margin} css={styles.container}>
      <Logo css={styles.logo} />
      <Typography.Title level={3} css={styles.title}>
        Ready to experience Ethos?
      </Typography.Title>
      <Link href={`${routTo.profile}?claimedXp=true`}>
        <ActionButton variant="outlined" color="primary">
          See your profile
        </ActionButton>
      </Link>
    </Flex>
  );
}
