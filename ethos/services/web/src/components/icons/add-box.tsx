import Icon from '@ant-design/icons';
import { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

function Svg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24" width="1em">
      <path
        fill="currentColor"
        d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4z"
      />
    </svg>
  );
}

export function AddBoxIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
