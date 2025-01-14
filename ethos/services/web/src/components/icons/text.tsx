import Icon from '@ant-design/icons';
import { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 28 28"
      fill="currentColor"
    >
      <path d="m16.532 5.833 5.635 5.635v10.699H5.833V5.833h10.699Zm0-2.333H5.833A2.34 2.34 0 0 0 3.5 5.833v16.334A2.34 2.34 0 0 0 5.833 24.5h16.334a2.34 2.34 0 0 0 2.333-2.333V11.468c0-.618-.245-1.213-.688-1.645l-5.635-5.635a2.294 2.294 0 0 0-1.645-.688Zm-8.365 14h11.666v2.333H8.167V17.5Zm0-4.667h11.666v2.334H8.167v-2.334Zm0-4.666h8.166V10.5H8.167V8.167Z" />
    </svg>
  );
}

export function TextIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
