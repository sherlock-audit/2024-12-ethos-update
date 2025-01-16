import { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

import Icon from './icon.tsx';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M8.283 3.739c-1.358 6.283 3.125 10.341 6.383 11.5a6.66 6.66 0 0 1-4.108 1.424A6.675 6.675 0 0 1 3.89 9.997a6.664 6.664 0 0 1 4.392-6.258Zm2.267-2.067c-4.659 0-8.325 3.775-8.325 8.325 0 4.6 3.733 8.333 8.333 8.333 3.092 0 5.775-1.683 7.217-4.183C11.516 13.938 7.7 7.122 10.84 1.672h-.291Z" />
    </svg>
  );
}

export function MoonOutlined(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
