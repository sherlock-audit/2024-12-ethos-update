import { formatXPScore } from '@ethos/helpers';
import { Flex, Typography } from 'antd';
import { AcceptedReferralCard } from '../_components/accepted-referral-card.component';
import { ShareReferral } from '../_components/share-referral.component';
import { EthosStar } from 'components/icons';
import { PageLottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import { tokenCssVars } from 'config/theme';
import { useThemeMode } from 'contexts/theme-manager.context';
import { useAcceptedReferrals } from 'hooks/api/echo.hooks';
import { type useActor } from 'hooks/user/activities';

const MAX_REFERRALS_TO_SHOW = 3;

export function StepTwo({
  twitterUser,
  twitterUserId,
  initialBonus,
  receivedReferralBonus,
}: {
  twitterUser: ReturnType<typeof useActor>;
  twitterUserId: string;
  initialBonus: number;
  receivedReferralBonus: number;
}) {
  const mode = useThemeMode();
  const { data: acceptedReferrals, isPending } = useAcceptedReferrals({
    pagination: { limit: MAX_REFERRALS_TO_SHOW },
  });

  if (isPending || !acceptedReferrals) {
    return <PageLottieLoader />;
  }

  const visibleReferrals = acceptedReferrals.values.reduce(
    (acc, r) => acc + r.bonusAmountForSender,
    0,
  );

  return (
    <Flex
      vertical
      gap={20}
      align="center"
      css={{
        padding: 16,
        backgroundColor: tokenCssVars.colorBgContainer,
        minHeight: tokenCssVars.fullHeight,
        justifyContent: 'center',
      }}
    >
      {acceptedReferrals.total > 0 && (
        <Flex
          vertical
          gap={12}
          align="center"
          css={{
            width: '100%',
          }}
        >
          <Typography.Title level={3}>Top referrals</Typography.Title>
          <Typography.Text>for {twitterUser.name}</Typography.Text>
          {acceptedReferrals.values.map((r) => (
            <AcceptedReferralCard key={r.twitterUserId} referral={r} />
          ))}
          {acceptedReferrals.total > MAX_REFERRALS_TO_SHOW && (
            <Flex justify="center" align="center" gap={4}>
              <Typography.Text
                css={{
                  color: tokenCssVars.colorText,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                and {acceptedReferrals.total - MAX_REFERRALS_TO_SHOW} more for a total of +
                {formatXPScore(receivedReferralBonus - visibleReferrals)}
              </Typography.Text>
              <EthosStar
                css={{
                  fontSize: 18,
                  lineHeight: 1,
                  color: mode === 'light' ? tokenCssVars.orange7 : tokenCssVars.orange6,
                }}
              />
            </Flex>
          )}
        </Flex>
      )}
      <ShareReferral
        twitterUserId={twitterUserId}
        initialBonus={initialBonus}
        score={twitterUser.score}
      />
    </Flex>
  );
}
