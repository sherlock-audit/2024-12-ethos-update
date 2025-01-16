import Icon, { type CustomIconComponentProps } from './icon.tsx';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 28 28"
      fill="currentColor"
    >
      <path d="M23.334 4.664H4.667a2.33 2.33 0 0 0-2.321 2.333l-.012 14a2.34 2.34 0 0 0 2.333 2.334h18.667a2.34 2.34 0 0 0 2.333-2.334v-14a2.34 2.34 0 0 0-2.333-2.333ZM4.667 10.497h12.25v4.084H4.667v-4.084Zm0 6.417h12.25v4.083H4.667v-4.083Zm18.667 4.083h-4.083v-10.5h4.083v10.5Z" />
    </svg>
  );
}

export function WebIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
