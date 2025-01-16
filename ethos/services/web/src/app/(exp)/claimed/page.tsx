'use client';
import { css } from '@emotion/react';
import { extractEchoErrorCode } from '@ethos/echo-client';
import { ConfigProvider, Flex } from 'antd';
import { getCookie } from 'cookies-next/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StepOne } from './steps/step-one.component';
import { StepThree } from './steps/step-three.component';
import { StepTwo } from './steps/step-two.component';
import { FeatureGatedPage } from 'components/feature-gate/feature-gate-route';
import {
  CenteredLottieLoader,
  PageLottieLoader,
} from 'components/loading-wrapper/lottie-loader.component';
import { lightTheme, tokenCssVars } from 'config/theme';
import { CLAIM_TWITTER_USER_COOKIE_KEY } from 'constant/claim';
import { useClaimStats } from 'hooks/api/echo.hooks';
import { useActor } from 'hooks/user/activities';

const styles = {
  stepsContainer: css({
    scrollSnapType: 'y mandatory',
    overflowY: 'scroll',
    height: tokenCssVars.fullHeight,
    '> *': {
      scrollSnapAlign: 'start',
    },
  }),
  loader: css({
    width: tokenCssVars.fullWidth,
    height: tokenCssVars.fullHeight,
    backgroundColor: lightTheme.token.colorBgContainer,
  }),
};

export default function Page() {
  const router = useRouter();
  const twitterUserId = getCookie(CLAIM_TWITTER_USER_COOKIE_KEY) ?? '';
  const actor = useActor({ service: 'x.com', account: twitterUserId });
  const { data: claimStats, isPending, error } = useClaimStats({ throwOnError: false });

  const errorCode = extractEchoErrorCode(error);

  useEffect(() => {
    if (!twitterUserId || errorCode === 'UNAUTHORIZED') {
      // TODO: [CORE-1672] include referral id, if present
      router.push('/claim');
    }
  }, [errorCode, router, twitterUserId]);

  if (isPending || !claimStats || error) {
    return <PageLottieLoader />;
  }

  return (
    <FeatureGatedPage featureGate="showExpClaimPage" height={tokenCssVars.fullHeight}>
      <ConfigProvider theme={lightTheme}>
        {actor.isPending ? (
          <Flex justify="center" css={styles.loader}>
            <CenteredLottieLoader mode="light" fullWidth fullHeight />
          </Flex>
        ) : (
          <div css={styles.stepsContainer}>
            <StepOne twitterUser={actor} claimAmount={claimStats.totalAmount ?? 0} />
            <StepTwo
              twitterUser={actor}
              twitterUserId={twitterUserId}
              initialBonus={claimStats.initialBonus ?? 0}
              receivedReferralBonus={claimStats.receivedReferralBonus ?? 0}
            />
            <StepThree twitterUser={actor} twitterUserId={twitterUserId} />
          </div>
        )}
      </ConfigProvider>
    </FeatureGatedPage>
  );
}
