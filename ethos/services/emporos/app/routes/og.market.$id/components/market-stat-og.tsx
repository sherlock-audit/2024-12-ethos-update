import { darkTheme } from '~/config/theme.ts';

export function MarketStatOG({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div
      tw="flex items-center font-semibold"
      style={{ gap: '12px', color: darkTheme.token.colorTextBase }}
    >
      <span tw="text-[40px]">{icon}</span>
      <span tw="flex" style={{ gap: '8px' }}>
        {value}
        <span tw="font-normal">{label}</span>
      </span>
    </div>
  );
}
