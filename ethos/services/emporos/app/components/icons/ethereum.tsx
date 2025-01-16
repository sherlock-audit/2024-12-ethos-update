import Icon, { type CustomIconComponentProps } from './icon.tsx';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="m8.674 1.273-4.166 7 4.166 2.5 4.167-2.5-4.167-7ZM4.508 9.107l4.166 5.833 4.167-5.833-4.167 2.5-4.166-2.5Z" />
    </svg>
  );
}

export function EthereumIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
