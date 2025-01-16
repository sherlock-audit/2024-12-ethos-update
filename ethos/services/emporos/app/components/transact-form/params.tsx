import { useSearchParams } from 'react-router-dom';

export const QueryParamKeys = {
  action: 'action',
  voteType: 'voteType',
  transact: 'transact',
  sellAmount: 'sellAmount',
  buyAmountEth: 'buyAmountEth',
  slippagePercentage: 'slippagePercentage',
} as const;

export function useTransactSearchParams() {
  const [searchParams] = useSearchParams();

  const buyAmountEth = searchParams.get(QueryParamKeys.buyAmountEth);
  const sellAmount = searchParams.get(QueryParamKeys.sellAmount);
  const action: 'sell' | 'buy' =
    searchParams.get(QueryParamKeys.action) === 'sell' ? 'sell' : 'buy';
  const voteType: 'trust' | 'distrust' =
    searchParams.get(QueryParamKeys.voteType) === 'distrust' ? 'distrust' : 'trust';
  const transact = Boolean(searchParams.get(QueryParamKeys.transact));
  const slippagePercentage = Number(searchParams.get(QueryParamKeys.slippagePercentage));

  return {
    action,
    voteType,
    transact,
    sellAmount: sellAmount ? Number(sellAmount) : null,
    buyAmountEth: buyAmountEth ? Number(buyAmountEth) : null,
    slippagePercentage,
  };
}
