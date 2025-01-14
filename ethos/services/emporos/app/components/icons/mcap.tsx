import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function McapSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 40 40"
      fill="currentColor"
    >
      <path d="M18.236 3.422V36.58C9.83 35.75 3.314 28.639 3.314 20c0-8.638 6.516-15.75 14.922-16.58Zm3.366 0v14.905h14.871c-.779-7.859-7.03-14.126-14.871-14.905Zm0 18.254V36.58c7.858-.78 14.092-7.047 14.871-14.905H21.602Z" />
    </svg>
  );
}

export function McapIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={McapSvg} {...props} />;
}
