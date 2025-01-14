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
      <path d="M1.756 3.102h3.2v3.2h-3.2v-3.2ZM8.156 3.102h3.2v3.2h-3.2v-3.2Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.712 7.527c.161-.389.244-.805.244-1.225h3.2a6.403 6.403 0 0 1-6.4 6.4v-3.2a3.2 3.2 0 0 0 2.956-1.975ZM11.112 7.527c.161-.389.244-.805.244-1.225h3.2a6.4 6.4 0 0 1-6.4 6.4v-3.2a3.2 3.2 0 0 0 2.956-1.975Z"
      />
    </svg>
  );
}

export function EthosReviewIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
