import { isValidAddress } from '@ethos/helpers';
import { type Rule } from 'antd/es/form/index';
import { useMemo } from 'react';
import { parseEther } from 'viem';
import { isValidENS } from '~/utils/ens.ts';

export function useWithdrawFormRules(balance: bigint) {
  const amountRules = useMemo<Rule[]>(
    () => [
      { required: true, message: 'Please enter a valid amount!' },
      {
        validator: async (_, value?: string) => {
          if (parseEther(value ?? '0') > balance) {
            throw new Error('Insufficient balance');
          }
        },
      },
    ],
    [balance],
  );

  const addressRules = useMemo<Rule[]>(
    () => [
      { required: true, message: 'Please input address or ENS name' },
      {
        async validator(_, value?: string) {
          if (!value) {
            return;
          }
          if (isValidAddress(value) || isValidENS(value)) {
            return;
          }

          throw new Error('Invalid address or ENS name');
        },
      },
    ],
    [],
  );

  return { amountRules, addressRules };
}
