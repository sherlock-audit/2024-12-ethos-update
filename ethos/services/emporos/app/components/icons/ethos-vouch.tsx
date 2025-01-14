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
      <path d="m7.983 14.67-6.649-3.658V2.838A13.26 13.26 0 0 0 4 4.012v5.423l4 2.2 4-2.2V4.012a13.26 13.26 0 0 0 2.667-1.174v8.174l-6.65 3.657h-.034ZM14.667 2.838Z" />
      <path d="M12 1.336v2.676c-.854.268-1.746.453-2.666.544v-3.22H12ZM6.668 1.336H4v2.676c.856.268 1.748.453 2.668.544v3.888h2.666V4.556a13.492 13.492 0 0 1-2.666 0v-3.22Z" />
    </svg>
  );
}

export function EthosVouchIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
