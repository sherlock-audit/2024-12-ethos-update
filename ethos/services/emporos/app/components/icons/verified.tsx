import Icon, { type CustomIconComponentProps } from './icon.tsx';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 14 14"
      fill="currentColor"
    >
      <path d="M6.527.741 2.444 2.555c-.42.187-.694.607-.694 1.068v2.742c0 3.237 2.24 6.265 5.25 7 3.01-.735 5.25-3.763 5.25-7V3.623c0-.46-.274-.88-.694-1.068L7.473.741a1.16 1.16 0 0 0-.946 0ZM5.42 9.451 3.91 7.94a.58.58 0 1 1 .822-.823l1.102 1.097 3.43-3.43a.58.58 0 1 1 .823.822L6.242 9.45a.58.58 0 0 1-.823 0Z" />
    </svg>
  );
}

export function VerifiedIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
