import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { type Vouch, type VouchFunds } from '@ethos/blockchain-manager';
import { useCopyToClipboard } from '@ethos/common-ui';
import { type LiteProfile } from '@ethos/domain';
import { formatEth } from '@ethos/helpers';
import { useFeatureGate } from '@statsig/react-bindings';
import { Button, Dropdown, Popconfirm } from 'antd';
import { type ItemType } from 'antd/es/menu/interface';
import Link from 'next/link';
import { useState } from 'react';
import {
  ReviewFilled,
  SlashFilled,
  VouchFilled,
  ManageAccounts,
  ClipboardIcon,
} from 'components/icons';
import { tokenCssVars } from 'config/theme';
import { featureGates } from 'constant/feature-flags';

type DropdownMenuActionsProps = {
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

export function DropdownMenuActions({
  isCurrentUser,
  targetProfile,
  connectedProfile,
  vouchByConnectedAddress,
  onReviewClick,
  onVouchClick,
  onUnvouchClick,
  onSlashClick,
  hasReviews,
}: DropdownMenuActionsProps) {
  const copyToClipboard = useCopyToClipboard();
  const [open, setOpen] = useState(false); // State to track dropdown open/closed
  const vouchedAmount = vouchByConnectedAddress?.staked ?? 0n;
  const { value: isSlashingEnabled } = useFeatureGate(featureGates.showSocialSlashing);
  const showUnreviewedWarning = !targetProfile && !hasReviews;

  const items: ItemType[] = [
    ...(!isCurrentUser
      ? [
          {
            key: 'review',
            label: 'Review',
            icon: <ReviewFilled />,
            onClick: onReviewClick,
          },
          {
            key: 'vouch',
            label: vouchByConnectedAddress ? (
              <span
                css={css`
                  color: ${tokenCssVars.colorPrimary};
                `}
              >
                Vouched · {formatEth(vouchedAmount)}
              </span>
            ) : showUnreviewedWarning ? (
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
                <span>Vouch</span>
              </Popconfirm>
            ) : (
              'Vouch'
            ),
            icon: (
              <VouchFilled
                css={css`
                  color: ${vouchByConnectedAddress ? tokenCssVars.colorPrimary : undefined};
                `}
              />
            ),
            disabled: vouchByConnectedAddress
              ? false
              : targetProfile
                ? false
                : !showUnreviewedWarning,
            onClick: vouchByConnectedAddress
              ? onUnvouchClick
              : !showUnreviewedWarning
                ? onVouchClick
                : undefined,
          },
          {
            key: 'slash',
            label: isSlashingEnabled ? 'Slash' : 'Slash (Coming Soon)',
            disabled: !isSlashingEnabled,
            icon: <SlashFilled />,
            onClick: isSlashingEnabled ? onSlashClick : undefined,
          },
          {
            key: 'copy-profile',
            label: 'Copy link',
            onClick: async () => {
              const { origin, pathname } = window.location;

              await copyToClipboard(
                new URL(pathname, origin).toString(),
                'Link successfully copied',
              );
            },
            icon: <ClipboardIcon />,
          },
        ]
      : []),

    ...(isCurrentUser && connectedProfile
      ? [
          {
            key: 'vouch-balances',
            label: <Link href="/profile/vouches">Vouch balances</Link>,
            icon: <VouchFilled />,
          },
          {
            key: 'profile-settings',
            label: <Link href="/profile/settings">Settings</Link>,
            icon: <ManageAccounts />,
          },
        ]
      : []),
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      onOpenChange={(state) => {
        setOpen(state);
      }}
      open={open}
    >
      <Button
        type="primary"
        iconPosition="end"
        icon={open ? <CaretUpOutlined /> : <CaretDownOutlined />}
        ghost
      >
        Actions
      </Button>
    </Dropdown>
  );
}
