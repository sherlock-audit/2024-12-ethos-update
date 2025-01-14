import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function CommentSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M16.4925 3C16.4925 2.175 15.825 1.5 15 1.5H3C2.175 1.5 1.5 2.175 1.5 3V12C1.5 12.825 2.175 13.5 3 13.5H13.5L16.5 16.5L16.4925 3ZM15 3V12.8775L14.1225 12H3V3H15ZM4.5 9H13.5V10.5H4.5V9ZM4.5 6.75H13.5V8.25H4.5V6.75ZM4.5 4.5H13.5V6H4.5V4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CommentIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={CommentSvg} {...props} />;
}
