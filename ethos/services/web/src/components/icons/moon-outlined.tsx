import Icon from '@ant-design/icons';
import { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M8.283 3.737c-1.358 6.283 3.125 10.341 6.384 11.5a6.661 6.661 0 0 1-4.109 1.425 6.676 6.676 0 0 1-6.666-6.667 6.664 6.664 0 0 1 4.391-6.258ZM10.55 1.67c-4.658 0-8.325 3.775-8.325 8.325 0 4.6 3.733 8.333 8.333 8.333 3.092 0 5.775-1.683 7.217-4.183C11.517 13.937 7.7 7.12 10.842 1.67h-.292Z" />
    </svg>
  );
}

export function MoonOutlined(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
