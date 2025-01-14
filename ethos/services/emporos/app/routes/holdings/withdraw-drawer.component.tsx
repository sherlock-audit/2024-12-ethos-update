import { useIsMobile } from '@ethos/common-ui';
import { Drawer, Flex } from 'antd';
import { WithdrawForm } from './withdraw-form.component.tsx';
import { VaulDrawer } from '~/components/drawer/vaul-drawer.tsx';
import { WalletBalance } from '~/components/transact-form/components/balance.component.tsx';

export function WithdrawDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <VaulDrawer title={<DrawerTitle />} open={isOpen} onClose={onClose}>
        <WithdrawForm onClose={onClose} />
      </VaulDrawer>
    );
  }

  return (
    <Drawer
      title={<DrawerTitle />}
      open={isOpen}
      onClose={onClose}
      className="[&_.ant-drawer-header-title]:items-center"
      classNames={{
        content: 'bg-antd-colorBgElevated',
      }}
    >
      <WithdrawForm onClose={onClose} />
    </Drawer>
  );
}

function DrawerTitle() {
  return (
    <Flex justify="space-between" align="center" className="w-full">
      Withdraw
      <WalletBalance className="ml-auto mr-0 bg-transparent" />
    </Flex>
  );
}
