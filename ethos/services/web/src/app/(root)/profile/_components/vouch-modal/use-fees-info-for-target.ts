import { type Fees } from '@ethos/blockchain-manager';
import { type EthosUserTarget } from '@ethos/domain';
import { useMemo } from 'react';
import { useFeesInfo } from 'hooks/api/echo.hooks';
import { useVouchStats } from 'hooks/user/lookup';

export function useFeesInfoForTarget(target: EthosUserTarget): Fees | undefined {
  const { data: fees } = useFeesInfo();
  const vouchStats = useVouchStats(target);

  return useMemo(() => {
    if (vouchStats.data?.count.received === 0 && fees) {
      return {
        ...fees,
        entryVouchersPoolFeeBasisPoints: BigInt(0),
      };
    }

    return fees;
  }, [fees, vouchStats.data?.count.received]);
}
