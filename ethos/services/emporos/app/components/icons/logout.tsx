import { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import Icon from './icon.tsx';

function LogoutIconSvg() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m17 8-1.41 1.41L17.17 11H9v2h8.17l-1.58 1.58L17 16l4-4-4-4ZM5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5V5Z" />
    </svg>
  );
}

export function LogoutIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={LogoutIconSvg} {...props} />;
}
