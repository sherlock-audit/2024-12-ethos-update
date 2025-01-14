import { formatEth } from '@ethos/helpers';
import { useFundWallet } from '@privy-io/react-auth';
import { Button, Card, Flex, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { type Address } from 'viem';
import { WithdrawDrawer } from './withdraw-drawer.component.tsx';
import { useEnvironment } from '~/hooks/env.tsx';
import { useUserBalance } from '~/hooks/marketUser.tsx';

export function HoldingsProfile({
  holdingsTotal,
  walletAddress,
}: {
  holdingsTotal: bigint;
  walletAddress: Address;
}) {
  const { formattedValue } = useUserBalance();

  const { fundWallet } = useFundWallet();
  const environment = useEnvironment();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <>
      <Card className="w-full md:w-fit md:min-w-80">
        <Flex vertical className="gap-4">
          <Flex className="gap-2 md:gap-4" justify="space-between">
            <Flex vertical>
              <Typography.Title level={4}>Holdings</Typography.Title>
              <Typography.Title level={2}>{formatEth(holdingsTotal, 'wei')}</Typography.Title>
            </Flex>
            <Flex vertical>
              <Typography.Title level={4}>Wallet Balance</Typography.Title>
              <Typography.Title level={2}>{formattedValue}</Typography.Title>
            </Flex>
          </Flex>
          <Tooltip title={environment === 'prod' ? undefined : 'Works on mainnet only'}>
            <Button
              type="primary"
              onClick={async () => {
                await fundWallet(walletAddress);
              }}
            >
              Fund wallet
            </Button>
          </Tooltip>
          <Button
            type="default"
            variant="outlined"
            className="border border-antd-colorTextBase"
            onClick={() => {
              setIsWithdrawOpen(true);
            }}
          >
            Withdraw
          </Button>
        </Flex>
      </Card>
      <WithdrawDrawer
        isOpen={isWithdrawOpen}
        onClose={() => {
          setIsWithdrawOpen(false);
        }}
      />
    </>
  );
}
