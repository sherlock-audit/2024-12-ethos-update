'use client';

import { css } from '@emotion/react';
import { claimErrors, MAX_REFERRAL_USES } from '@ethos/domain';
import { App, ConfigProvider } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { StepFive } from './steps/step-five.component';
import { StepFour } from './steps/step-four.component';
import { StepOne } from './steps/step-one.component';
import { StepThree } from './steps/step-three.component';
import { StepTwo } from './steps/step-two.component';
import { FeatureGatedPage } from 'components/feature-gate/feature-gate-route';
import { lightTheme, tokenCssVars } from 'config/theme';

const { useApp } = App;

const styles = {
  stepsContainer: css({
    scrollSnapType: 'y mandatory',
    overflowY: 'scroll',
    height: tokenCssVars.fullHeight,
    '> *': {
      scrollSnapAlign: 'start',
    },
  }),
};

export default function Page() {
  const searchParams = useSearchParams();
  const { notification } = useApp();

  const error = searchParams.get('error');
  useEffect(() => {
    if (error) {
      const connectElement = document.getElementById('connect');

      if (connectElement) {
        connectElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [error]);

  useEffect(() => {
    if (error && error !== claimErrors.accessDenied) {
      notification.error({
        message: 'Failed to claim XP',
        description: getErrorDescription(error),
        duration: 0, // Show until dismissed
      });
    }
  }, [error, notification]);

  return (
    <FeatureGatedPage featureGate="showExpClaimPage" height={tokenCssVars.fullHeight}>
      <ConfigProvider theme={lightTheme}>
        <div css={styles.stepsContainer}>
          <StepOne />
          <StepTwo />
          <StepThree />
          <StepFour />
          <StepFive />
        </div>
      </ConfigProvider>
    </FeatureGatedPage>
  );
}

function getErrorDescription(error: string) {
  switch (error) {
    case claimErrors.noUser:
      return 'Failed to connect x.com. Please try again.';
    case claimErrors.failedToClaim:
      return 'Failed to claim XP. Please try again.';
    case claimErrors.invalidReferrer:
      return 'Invalid referrer.';
    case claimErrors.referralLimitReached:
      return `Referral limit reached (${MAX_REFERRAL_USES} referral links used).`;
    default:
      return `Error code: ${error}`;
  }
}
