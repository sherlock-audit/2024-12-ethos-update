import { type Vouch, type VouchFunds } from '@ethos/blockchain-manager';
import { type LiteProfile } from '@ethos/domain';
import { formatEth } from '@ethos/helpers';
import { useFeatureGate } from '@statsig/react-bindings';
import { Button, Flex, Tooltip, Popconfirm } from 'antd';
import { AuthMiddleware } from 'components/auth/auth-middleware';
import { CustomPopover } from 'components/custom-popover/custom-popover.component';
import { ReviewFilled, SlashFilled, VouchFilled, ManageAccounts } from 'components/icons';
import { featureGates } from 'constant/feature-flags';

type InlineButtonActionsProps = {
  isCurrentUser: boolean;
  connectedProfile: LiteProfile | null | undefined;
  vouchByConnectedAddress: (Vouch & VouchFunds) | null;
  onReviewClick: () => void;
  onVouchClick: () => void;
  onUnvouchClick: () => void;
  onSlashClick: () => void;
  hasReviews?: boolean;
  targetProfile: LiteProfile | null | undefined;
};

export function InlineButtonActions({
  isCurrentUser,
  connectedProfile,
  vouchByConnectedAddress,
  onReviewClick,
  onVouchClick,
  onUnvouchClick,
  hasReviews = false,
  targetProfile,
  onSlashClick,
}: InlineButtonActionsProps) {
  const vouchedAmount = vouchByConnectedAddress?.staked ?? 0n;
  const { value: isSlashingEnabled } = useFeatureGate(featureGates.showSocialSlashing);
  const showUnreviewedWarning = !targetProfile && !hasReviews;

  // If the profile being viewed does not belong to the current user
  if (!isCurrentUser) {
    return (
      <Flex gap="small" align="center">
        <AuthMiddleware>
          <Button type="primary" icon={<ReviewFilled />} onClick={onReviewClick}>
            Review
          </Button>
        </AuthMiddleware>
        {vouchByConnectedAddress ? (
          <AuthMiddleware>
            <Tooltip title="Remove vouch?">
              <Button type="primary" icon={<VouchFilled />} onClick={onUnvouchClick}>
                Vouched · {formatEth(vouchedAmount)}
              </Button>
            </Tooltip>
          </AuthMiddleware>
        ) : (
          <AuthMiddleware>
            {showUnreviewedWarning ? (
              <Popconfirm
                title="Review required before vouching."
                description={
                  <div>
                    This account has never been reviewed. <br />
                    In order to vouch for it, please write the first review.
                  </div>
                }
                okButtonProps={{ style: { display: 'none' } }}
                cancelButtonProps={{ style: { display: 'none' } }}
              >
                <Button type="primary" icon={<VouchFilled />}>
                  Vouch
                </Button>
              </Popconfirm>
            ) : (
              <Button type="primary" icon={<VouchFilled />} onClick={onVouchClick}>
                Vouch
              </Button>
            )}
          </AuthMiddleware>
        )}
        {isSlashingEnabled ? (
          <Button type="primary" icon={<SlashFilled />} onClick={onSlashClick}>
            Slash
          </Button>
        ) : (
          <CustomPopover
            content={<div>Slashing will be enabled for Ethos at a later date.</div>}
            title="Coming Soon"
            trigger="click"
          >
            <Button type="primary" icon={<SlashFilled />}>
              Slash
            </Button>
          </CustomPopover>
        )}
      </Flex>
    );
  }

  // If the current user is viewing their own profile and has a connected Ethos profile
  if (connectedProfile) {
    return (
      <Flex gap="small" align="center">
        <Button type="primary" icon={<VouchFilled />} href="/profile/vouches">
          Vouch balances
        </Button>
        <Button type="primary" icon={<ManageAccounts />} href="/profile/settings">
          Settings
        </Button>
      </Flex>
    );
  }

  // no actions to display
  return null;
}
