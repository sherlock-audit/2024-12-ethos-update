import { css } from '@emotion/react';
import { Flex, Typography } from 'antd';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { claimDescription, claimTitle } from '../styles/typography';
import { ActionButton } from 'app/(exp)/_components/action-button.component';
import { EthosStar } from 'components/icons';
import { getEchoBaseUrl } from 'config/misc';
import { tokenCssVars } from 'config/theme';

export function StepFive() {
  const searchParams = useSearchParams();
  const referralId = searchParams.get('referral');
  const connectUrl = new URL('/api/v1/claim/twitter/login', getEchoBaseUrl());

  if (referralId) {
    connectUrl.searchParams.append('referralId', referralId);
  }

  return (
    <Flex
      id="connect"
      vertical
      align="center"
      justify="center"
      gap="large"
      css={css({
        backgroundColor: tokenCssVars.colorPrimary,
        height: tokenCssVars.fullHeight,
        padding: tokenCssVars.padding,
      })}
    >
      <EthosStar
        css={css`
          color: ${tokenCssVars.colorBgElevated};
          font-size: 40px;
        `}
      />
      <Typography.Title
        level={3}
        css={[
          claimTitle,
          {
            color: tokenCssVars.colorBgElevated,
          },
        ]}
      >
        We’re rewarding
      </Typography.Title>
      <Typography.Text
        css={[
          claimDescription,
          {
            color: tokenCssVars.colorBgElevated,
          },
        ]}
      >
        People with existing credibility
        <br /> in crypto
      </Typography.Text>
      <Link href={connectUrl.toString()}>
        <ActionButton type="default" variant="outlined" color="primary">
          Connect x.com & claim
        </ActionButton>
      </Link>
    </Flex>
  );
}
