import { useDebouncedValue } from '@ethos/common-ui';
import { isValidAddress, shortenHash } from '@ethos/helpers';
import { type UnsignedTransactionRequest } from '@privy-io/react-auth';
import { Alert, Button, Flex, Form, Input, Typography, type FormProps } from 'antd';
import { useEffect, useState } from 'react';
import { parseEther } from 'viem';
import { normalize } from 'viem/ens';
import { useEnsAddress } from 'wagmi';
import { useWithdrawFormRules } from './use-withdraw-form-rules.ts';
import { useWithdrawMutation } from './use-withdraw-mutation.tsx';
import { WalletIcon } from '~/components/icons/wallet.tsx';
import { ThreeDotsAnimation } from '~/components/three-dot-animation.tsx';
import { ConvenienceButtons } from '~/components/transact-form/components/convenience-buttons.component.tsx';
import { mainnetConfig } from '~/config/wagmi.ts';
import { useUserBalance } from '~/hooks/marketUser.tsx';
import { convertBalancePercentageToAmount } from '~/utils/amount.ts';
import { isValidENS } from '~/utils/ens.ts';

type FieldType = {
  amount: string;
  address: string;
};

export function WithdrawForm({ onClose }: { onClose: () => void }) {
  const [form] = Form.useForm<FieldType>();
  const balance = useUserBalance();
  const { amountRules, addressRules } = useWithdrawFormRules(balance.value);

  const address = Form.useWatch('address', form);
  const debouncedAddress = useDebouncedValue(address, 500);

  const isENS = isValidENS(debouncedAddress);
  const { data: ensAddress, isPending } = useEnsAddress({
    name: isENS ? normalize(debouncedAddress) : debouncedAddress,
    query: {
      enabled: isENS,
      retry: 1, // Retry one more if the first attempt fails (default is 3 and takes ~10s)
    },
    config: mainnetConfig,
  });

  const [displayMatchedWallet, setDisplayMatchedWallet] = useState(false);
  function onSuccess() {
    form.resetFields();
    onClose();
  }
  const withdrawMutation = useWithdrawMutation({
    onSuccess,
  });

  useEffect(() => {
    if (address) {
      setDisplayMatchedWallet(true);
    }
  }, [address]);

  // eslint-disable-next-line func-style
  const onSubmit: FormProps<FieldType>['onFinish'] = async (values) => {
    const value = parseEther(values.amount);

    if (isENS && !isValidAddress(ensAddress)) {
      form.setFields([
        {
          name: 'address',
          errors: ['No wallet found for this ENS'],
        },
      ]);

      setDisplayMatchedWallet(false);

      return;
    }

    const requestData: UnsignedTransactionRequest = {
      to: isENS && isValidAddress(ensAddress) ? ensAddress : values.address,
      value,
    };

    try {
      await withdrawMutation.mutateAsync(requestData);
    } catch (error) {
      // Do nothing since privy handles the error
    }
  };

  function handlePercentage(percentage: number) {
    const amount = convertBalancePercentageToAmount(balance.value, percentage);
    form.setFieldsValue({ amount });
  }

  return (
    <Form form={form} name="withdraw" className="flex flex-col gap-4" onFinish={onSubmit}>
      <Form.Item<FieldType> name="amount" rules={amountRules} className="mb-0">
        <Input
          placeholder="Amount"
          suffix="e"
          type="number"
          className="no-arrows"
          variant="filled"
          allowClear
        />
      </Form.Item>
      <ConvenienceButtons
        handlePercentage={handlePercentage}
        buttonClassName="w-full"
        containerClassName="gap-3"
      />
      <Flex vertical gap={4}>
        <Form.Item<FieldType> name="address" className="mb-0" rules={addressRules}>
          <Input placeholder="Wallet address or ENS" variant="filled" allowClear />
        </Form.Item>
        {isENS && displayMatchedWallet && (
          <Typography.Text className="text-antd-colorTextDescription flex items-center gap-2 ml-auto">
            <WalletIcon className="size-4" />
            {isPending ? (
              <ThreeDotsAnimation />
            ) : ensAddress ? (
              <span>Wallet found: {shortenHash(ensAddress)}</span>
            ) : (
              <span>No wallet found for this ENS</span>
            )}
          </Typography.Text>
        )}
      </Flex>

      <Alert
        type="warning"
        message="You are about to withdraw funds from Ethos.markets"
        description="Please check that the address is correct before clicking withdraw. Funds sent to the wrong address are not recoverable."
        showIcon
        className="bg-antd-colorBgLayout text-antd-colorText"
      />
      <Button type="primary" htmlType="submit" loading={withdrawMutation.isPending}>
        Withdraw
      </Button>
    </Form>
  );
}
