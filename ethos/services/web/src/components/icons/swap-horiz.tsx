import Icon from '@ant-design/icons';
import { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 14 12"
      fill="currentColor"
    >
      <path d="m3.2 5.3-3 3 3 3V9h5.3V7.5H3.2V5.2Zm10.6-1.5-3-3V3H5.5v1.5h5.3v2.3l3-3Z" />
    </svg>
  );
}

export function SwapHorizIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
