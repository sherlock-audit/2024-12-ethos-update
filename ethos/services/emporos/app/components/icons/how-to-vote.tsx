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
      <path d="M12.5 8.67h-.453l-1.334 1.333h1.274l1.18 1.334H3.833l1.187-1.334h1.367L5.053 8.67H4.5l-2 2v2.667c0 .733.593 1.333 1.327 1.333h9.34c.733 0 1.333-.593 1.333-1.333V10.67l-2-2Zm-.667-3.367-3.3 3.3-2.36-2.36 3.3-3.3 2.36 2.36ZM9.007 1.53 4.76 5.777c-.26.26-.26.68 0 .94l3.3 3.3c.26.26.68.26.94 0l4.24-4.24c.26-.26.26-.68 0-.94l-3.3-3.3a.65.65 0 0 0-.933-.007Z" />
    </svg>
  );
}

export function HowToVoteIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
