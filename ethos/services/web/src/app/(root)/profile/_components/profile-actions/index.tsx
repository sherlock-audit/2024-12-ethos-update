import { type Vouch, type VouchFunds } from '@ethos/blockchain-manager';
import { type LiteProfile } from '@ethos/domain';
import { DropdownMenuActions } from './dropdown-menu-actions';
import { InlineButtonActions } from './inline-button-actions';
import { hideOnBelowDesktopCSS, hideOnDesktopCSS } from 'styles/responsive';

type PageHeaderProps = {
  isCurrentUser: boolean;
  targetProfile: LiteProfile | null | undefined;
  connectedProfile: LiteProfile | null | undefined;
  vouchByConnectedAddress: (Vouch & VouchFunds) | null;
  onReviewClick: () => void;
  onVouchClick: () => void;
  onUnvouchClick: () => void;
  onSlashClick: () => void;
  hasReviews: boolean;
};

export function ProfileActions({
  isCurrentUser,
  targetProfile,
  connectedProfile,
  vouchByConnectedAddress,
  onReviewClick,
  onVouchClick,
  onUnvouchClick,
  onSlashClick,
  hasReviews,
}: PageHeaderProps) {
  return (
    <>
      <div css={hideOnDesktopCSS}>
        <DropdownMenuActions
          isCurrentUser={isCurrentUser}
          targetProfile={targetProfile}
          connectedProfile={connectedProfile}
          vouchByConnectedAddress={vouchByConnectedAddress}
          onReviewClick={onReviewClick}
          onVouchClick={onVouchClick}
          onUnvouchClick={onUnvouchClick}
          onSlashClick={onSlashClick}
          hasReviews={hasReviews}
        />
      </div>
      <div css={hideOnBelowDesktopCSS}>
        <InlineButtonActions
          isCurrentUser={isCurrentUser}
          targetProfile={targetProfile}
          connectedProfile={connectedProfile}
          vouchByConnectedAddress={vouchByConnectedAddress}
          onReviewClick={onReviewClick}
          onVouchClick={onVouchClick}
          onUnvouchClick={onUnvouchClick}
          onSlashClick={onSlashClick}
          hasReviews={hasReviews}
        />
      </div>
    </>
  );
}
