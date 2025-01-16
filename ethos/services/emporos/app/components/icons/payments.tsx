import Icon, { type CustomIconComponentProps } from './icon.tsx';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 18 18"
      fill="currentColor"
    >
      <path d="M14.25 10.5v-6c0-.825-.675-1.5-1.5-1.5H2.25c-.825 0-1.5.675-1.5 1.5v6c0 .825.675 1.5 1.5 1.5h10.5c.825 0 1.5-.675 1.5-1.5Zm-1.5 0H2.25v-6h10.5v6ZM7.5 5.25A2.247 2.247 0 0 0 5.25 7.5 2.247 2.247 0 0 0 7.5 9.75 2.247 2.247 0 0 0 9.75 7.5 2.247 2.247 0 0 0 7.5 5.25Zm9.75 0v8.25c0 .825-.675 1.5-1.5 1.5H3v-1.5h12.75V5.25h1.5Z" />
    </svg>
  );
}

export function PaymentsIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
