import { Flex, Typography } from 'antd';
import { ConvenienceButtons } from '../components/convenience-buttons.component.tsx';
import { ErrorMessage } from '../components/error-message.component.tsx';
import { FeeInfo } from '../components/fee-info.component.tsx';
import { type InputKey, NumericKeypad } from './numeric-keypad.component.tsx';
import { SwipeToTransact } from './swipe-to-transact.tsx';

const { Title } = Typography;

export function KeypadForm({
  handleNumberInput,
  handlePercentage,
  onSubmit,
  validationError,
  value,
  simulationInfo,
  balanceInfo,
  disabled = false,
}: {
  handleNumberInput: (value: InputKey) => void;
  handlePercentage: (percentage: number) => void;
  onSubmit: () => Promise<void>;
  validationError: string | null;
  value: string;
  balanceInfo: React.ReactNode;
  simulationInfo: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Flex vertical className="h-full px-2 gap-4 items-center w-full max-w-xs">
      {balanceInfo}
      <Flex vertical align="center" gap={8}>
        <Title level={4} className="m-0 text-7xl/none max-w-xs" ellipsis={{ tooltip: value }}>
          {value}
        </Title>
        {simulationInfo}
        <ErrorMessage errorMessage={validationError} />
      </Flex>
      <ConvenienceButtons
        disabled={disabled}
        handlePercentage={handlePercentage}
        buttonClassName="bg-antd-colorBgContainer font-plex"
      />
      <NumericKeypad disabled={disabled} onPress={handleNumberInput} />
      <SwipeToTransact onComplete={onSubmit} />
      <FeeInfo className="text-sm/none text-antd-colorText" />
    </Flex>
  );
}
