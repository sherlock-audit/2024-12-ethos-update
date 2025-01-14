import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function MarketsLogoSvg() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.4107 0.132812H37.3737V31.0285H26.4107V27.5324H28.4038V6.60301H26.4107V0.132812ZM24.1684 6.60301V3.37283H13.2054V10.0918H15.1984V31.0212H13.2054V34.2685H24.1684V27.5324H22.1748V6.60301H24.1684ZM10.963 6.61005V10.0918H8.96945V31.0212H10.963V37.5058H0V6.61005H10.963Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MarketsIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={MarketsLogoSvg} {...props} />;
}
