import { useFundWallet } from '@privy-io/react-auth';
import { App, Button, Flex, Typography } from 'antd';
import { PaymentsIcon } from '../icons/payments.tsx';
import { useEnvironment } from '~/hooks/env.tsx';
import { useConnectedWallet, useUserBalance } from '~/hooks/marketUser.tsx';

export function FundWalletBanner() {
  const environment = useEnvironment();
  const { notification } = App.useApp();
  const { fundWallet } = useFundWallet();
  const { wallet } = useConnectedWallet();
  const { isPending, value, isError } = useUserBalance();

  if (!wallet?.address || isError || isPending || value > 0n) {
    return null;
  }

  return (
    <Flex justify="center" className="w-full bg-advertisementCard">
      <Flex
        align="center"
        justify="space-between"
        className="header-horizontal-space py-2.5 w-full text-antd-colorBgContainer"
      >
        <Flex className="gap-0.5 flex-col md:flex-row md:gap-6 md:items-center">
          <Flex align="center" gap={4}>
            <PaymentsIcon className="text-[18px]" />
            <Typography.Title level={4} className="text-inherit">
              Make your first deposit
            </Typography.Title>
          </Flex>
          <Typography.Text className="text-inherit text-xs">
            Deposit eth to start trading
          </Typography.Text>
        </Flex>

        <Button
          type="default"
          onClick={async () => {
            if (environment === 'prod') {
              await fundWallet(wallet.address);
            } else {
              notification.info({
                message: 'Funding wallet',
                description: 'This feature is only available in mainnet',
              });
            }
          }}
        >
          Fund wallet
        </Button>
      </Flex>
    </Flex>
  );
}
