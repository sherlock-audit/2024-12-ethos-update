import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTransactSearchParams } from '~/components/transact-form/params.tsx';
import { type Market } from '~/types/markets.ts';

const DEFAULT_BUY_AMOUNT_ETH = 0.1;
const DEFAULT_SLIPPAGE_PERCENTAGE = 0.01;
const DEFAULT_SELL_AMOUNT = 1;
const DEFAULT_ACTION = 'buy';
const DEFAULT_VOTE_TYPE = 'trust';

type TransactionFormState = {
  market: Market;
  action: 'buy' | 'sell';
  voteType: 'trust' | 'distrust';
  sellAmount: number;
  buyAmountEth: number;
  isTransactDrawerOpen: boolean;
  transactionState: 'initial' | 'pending' | 'success' | 'error';
  transactionError: string | null;
  slippagePercentage: number;
};

type TransactionContextType = {
  state: TransactionFormState;
  setState: (state: Partial<TransactionFormState>) => void;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children, market }: PropsWithChildren<{ market: Market }>) {
  const { action, voteType, sellAmount, buyAmountEth, transact, slippagePercentage } =
    useTransactSearchParams();
  const [state, setStateInternal] = useState<TransactionFormState>({
    market,
    action: action ?? DEFAULT_ACTION,
    voteType: voteType ?? DEFAULT_VOTE_TYPE,
    sellAmount: sellAmount ?? DEFAULT_SELL_AMOUNT,
    buyAmountEth: buyAmountEth ?? DEFAULT_BUY_AMOUNT_ETH,
    isTransactDrawerOpen: transact ?? false,
    slippagePercentage: slippagePercentage || DEFAULT_SLIPPAGE_PERCENTAGE,
    transactionState: 'initial',
    transactionError: null,
  });

  const setState = useCallback((newState: Partial<TransactionFormState>) => {
    setStateInternal((prev) => ({ ...prev, ...newState }));
  }, []);

  useEffect(() => {
    setStateInternal((prev) => ({ ...prev, market }));
  }, [market]);

  return (
    <TransactionContext.Provider value={{ state, setState }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionForm() {
  const context = useContext(TransactionContext);

  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }

  return context;
}
