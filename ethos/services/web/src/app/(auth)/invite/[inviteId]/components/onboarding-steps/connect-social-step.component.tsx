import { css } from '@emotion/react';
import { Flex, theme, Typography } from 'antd';
import { OnboardingStep } from '../onboarding-step.component';
import { TwitterConnectFlow } from '../twitter-connect-flow.component';

type Props = {
  completeStep: () => void;
};

export function ConnectSocialStep({ completeStep }: Props) {
  const { token } = theme.useToken();

  return (
    <OnboardingStep
      icon={
        <div
          css={css`
            position: relative;
            width: 150px;
            height: 150px;
          `}
        >
          <div
            css={css`
              width: 180px;
              height: 180px;
              background-color: #6fa57a;
              border-radius: 50%;
            `}
          />
        </div>
      }
      title={
        <>
          Connect
          <br />
          Social
        </>
      }
      description={
        <Flex
          justify="center"
          css={css`
            width: 374px;
          `}
        >
          <Typography.Paragraph
            css={css`
              font-size: ${token.fontSizeLG}px;
            `}
          >
            We will review your X.com profile & add any existing reviews to your Ethos score.
          </Typography.Paragraph>
        </Flex>
      }
    >
      <TwitterConnectFlow completeStep={completeStep} skipStep={completeStep} />
    </OnboardingStep>
  );
}
