import { Input, type InputProps } from 'antd';
import clsx from 'clsx';

export function TransactInput({
  onChange,
  ...props
}: {
  onChange: (value: string) => void;
} & InputProps) {
  return (
    <div className="transact-input">
      <Input
        className={clsx(
          'bg-transparent text-center text-[64px] leading-none relative text-antd-colorTextBase font-queens',
          'overflow-hidden border-none outline-none w-full shadow-none',
        )}
        placeholder="0"
        onChange={(e) => {
          onChange(e.target.value);
        }}
        {...props}
      />
    </div>
  );
}
