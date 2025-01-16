import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Flex, theme, Typography } from 'antd';
import { OnboardingStep } from '../onboarding-step.component';
import { ContributionSteps } from './contribution-steps/contribution-steps.component';
import { EthosStar } from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { ONBOARDING_SKIP_SESSION_KEY } from 'constant/constants';
import { invalidate } from 'constant/queries/cache.invalidation';
import { cacheKeys } from 'constant/queries/queries.constant';
import { useCurrentUser } from 'contexts/current-user.context';
import { useSessionStorage } from 'hooks/use-storage';

type Props = {
  actionHover?: (impact: number) => void;
  stepCompleted: () => void;
};

export function StartContributingStep({ stepCompleted }: Props) {
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const { connectedAddress } = useCurrentUser();

  const [, setSkipOnboardingValue] = useSessionStorage<boolean>(ONBOARDING_SKIP_SESSION_KEY);

  async function onSkip() {
    if (connectedAddress) {
      await invalidate(queryClient, [cacheKeys.profile.byAddress(connectedAddress)]);
      await invalidate(queryClient, [
        cacheKeys.invitation.bySubject({ address: connectedAddress }),
      ]);
      setSkipOnboardingValue(true);
      stepCompleted?.();
    }
  }

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
              background-color: #8993bd;
              border-radius: 50%;
            `}
          />
        </div>
      }
      title={
        <div
          css={css`
            @media (max-height: 700px) {
              font-size: 32px;
              line-height: 1.2;
            }
          `}
        >
          Contribute
        </div>
      }
      description={
        <Flex
          justify="center"
          align="center"
          vertical
          css={css`
            padding: 0;
            @media (min-width: ${token.screenMD}px) {
              width: 500px;
              margin-inline: 0;
            }
            @media (max-height: 700px) {
              .ant-typography {
                font-size: ${token.fontSize}px !important;
              }
            }
          `}
        >
          <Typography.Paragraph
            css={css`
              font-size: ${token.fontSizeLG}px;
              margin-bottom: 0;
            `}
          >
            Ethos users earn contributor XP <EthosStar css={{ color: tokenCssVars.orange7 }} /> by
            helping others understand who can be trusted through:
          </Typography.Paragraph>
        </Flex>
      }
    >
      <Flex
        gap={token.marginXXL}
        justify="center"
        css={css`
          @media (max-width: ${token.screenMD}px) {
            width: 100%;
            padding: 0 20px;
            flex-direction: column;
            gap: 12px !important;
          }
          /* Compensating transition between 990 and 1150 pixels causing column overlap */
          @media (min-width: 990px) and (max-width: 1150px) {
            gap: 10px !important;
          }
        `}
      >
        <ContributionSteps />
      </Flex>
      <Flex vertical gap={6}>
        <Typography.Text css={{ fontSize: token.fontSizeLG }}>
          Ready to start contributing?
        </Typography.Text>
        <Button type="primary" onClick={onSkip}>
          Take me to Ethos
        </Button>
      </Flex>
    </OnboardingStep>
  );
}
