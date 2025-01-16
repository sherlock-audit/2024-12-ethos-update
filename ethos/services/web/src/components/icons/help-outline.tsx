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
      <path d="M9.166 14.997h1.667v-1.666H9.166v1.666Zm.833-13.333a8.336 8.336 0 0 0-8.333 8.333c0 4.6 3.733 8.334 8.333 8.334s8.334-3.734 8.334-8.334-3.734-8.333-8.334-8.333Zm0 15a6.676 6.676 0 0 1-6.666-6.667 6.676 6.676 0 0 1 6.666-6.666 6.676 6.676 0 0 1 6.667 6.666 6.676 6.676 0 0 1-6.667 6.667Zm0-11.667a3.332 3.332 0 0 0-3.333 3.334h1.667c0-.917.75-1.667 1.666-1.667.917 0 1.667.75 1.667 1.667 0 1.666-2.5 1.458-2.5 4.166h1.667c0-1.875 2.5-2.083 2.5-4.166a3.332 3.332 0 0 0-3.334-3.334Z" />
    </svg>
  );
}

export function HelpOutlineIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
