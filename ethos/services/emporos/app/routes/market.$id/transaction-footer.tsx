import { EllipsisOutlined } from '@ant-design/icons';
import { capitalize } from '@ethos/helpers';
import { type MenuProps, Flex, Button, Dropdown } from 'antd';
import { useCallback, useMemo } from 'react';
import { useTransactionForm } from './transaction-context.tsx';
import { VaulDrawer } from '~/components/drawer/vaul-drawer.tsx';
import { ThumbsDownFilledIcon, ThumbsUpFilledIcon } from '~/components/icons/thumbs.tsx';
import { MobileBuyForm } from '~/components/transact-form/mobile/mobile-buy-form.component.tsx';
import { MobileSellForm } from '~/components/transact-form/mobile/mobile-sell-form.component.tsx';
import { SlippageCog } from '~/components/transact-form/slippage-cog.component.tsx';
import { useMyVotes } from '~/hooks/market.tsx';
import { cn } from '~/utils/cn.ts';

export function TransactionFooter() {
  const { state, setState } = useTransactionForm();
  const { market, action, voteType } = state;
  const { data: myOwnedVotes } = useMyVotes(market.profileId);

  const onButtonClick = useCallback(
    (action: 'buy' | 'sell', voteType: 'trust' | 'distrust') => {
      setState({
        action,
        voteType,
        isTransactDrawerOpen: true,
        transactionState: 'initial',
      });
    },
    [setState],
  );

  const items: MenuProps['items'] = useMemo(() => {
    const menuItems = [];

    if (Number(myOwnedVotes?.trustVotes) > 0) {
      menuItems.push({
        key: 'sell-yes',
        label: 'Sell trust',
        onClick: () => {
          onButtonClick('sell', 'trust');
        },
      });
    }

    if (Number(myOwnedVotes?.distrustVotes) > 0) {
      menuItems.push({
        key: 'sell-no',
        label: 'Sell distrust',
        onClick: () => {
          onButtonClick('sell', 'distrust');
        },
      });
    }

    return menuItems;
  }, [myOwnedVotes, onButtonClick]);

  return (
    <Flex
      justify="space-between"
      className="w-full sticky bottom-[calc(calc(env(safe-area-inset-bottom)/2)+100px)] left-0 right-0 md:hidden py-0 px-2 xsm:px-4 bg-transparent gap-2 xsm:gap-4"
    >
      <Button
        className="bg-trust w-full shadow-floatButton text-antd-colorBgLayout max-xsm:px-2 text-sm"
        variant="filled"
        size="large"
        icon={<ThumbsUpFilledIcon />}
        onClick={() => {
          onButtonClick('buy', 'trust');
        }}
      >
        Buy trust {Math.round(market.trustPercentage)}%
      </Button>
      <Button
        className="bg-distrust w-full shadow-floatButton text-antd-colorBgLayout max-xsm:px-2 text-sm"
        variant="filled"
        size="large"
        icon={<ThumbsDownFilledIcon />}
        onClick={() => {
          onButtonClick('buy', 'distrust');
        }}
      >
        Buy distrust {Math.round(100 - market.trustPercentage)}%
      </Button>
      {items.length > 0 && (
        <Dropdown menu={{ items }} placement="topRight">
          <Button
            icon={<EllipsisOutlined />}
            size="large"
            className="min-w-8 shadow-floatButton bg-antd-colorBgElevated"
          />
        </Dropdown>
      )}
      <VaulDrawer
        title={
          <>
            <span className={cn(voteType === 'trust' ? 'text-trust' : 'text-distrust')}>
              {capitalize(action)} {voteType}
            </span>{' '}
            in {market.name}
          </>
        }
        titleSuffix={<SlippageCog />}
        open={state.isTransactDrawerOpen}
        className="md:hidden overflow-hidden"
        showCloseButton={false}
        contentCentered={true}
        onClose={() => {
          setState({ isTransactDrawerOpen: false });
        }}
      >
        {action === 'buy' ? <MobileBuyForm /> : <MobileSellForm />}
      </VaulDrawer>
    </Flex>
  );
}
