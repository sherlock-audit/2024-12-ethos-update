import Icon, { type CustomIconComponentProps } from './icon.tsx';

function CopyContentSvg() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="content_copy">
        <path
          id="Vector"
          d="M16.5 1H4.5C3.4 1 2.5 1.9 2.5 3V17H4.5V3H16.5V1ZM19.5 5H8.5C7.4 5 6.5 5.9 6.5 7V21C6.5 22.1 7.4 23 8.5 23H19.5C20.6 23 21.5 22.1 21.5 21V7C21.5 5.9 20.6 5 19.5 5ZM19.5 21H8.5V7H19.5V21Z"
        />
      </g>
    </svg>
  );
}

export function CopyContentIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={CopyContentSvg} {...props} />;
}