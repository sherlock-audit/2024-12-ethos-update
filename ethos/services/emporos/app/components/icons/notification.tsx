import Icon, { type CustomIconComponentProps } from './icon.tsx';

function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 26 26"
      fill="currentColor"
    >
      <path d="M13 23.563a2.173 2.173 0 0 0 2.167-2.167h-4.333c0 1.191.975 2.166 2.167 2.166Zm6.5-6.5v-5.417c0-3.326-1.765-6.11-4.874-6.847v-.737c0-.899-.726-1.625-1.625-1.625-.9 0-1.625.726-1.625 1.626v.736C8.277 5.536 6.5 8.31 6.5 11.646v5.416L4.334 19.23v1.084h17.333v-1.084l-2.166-2.166Zm-2.166 1.083H8.667v-6.5c0-2.687 1.636-4.875 4.334-4.875 2.697 0 4.333 2.188 4.333 4.875v6.5Z" />
    </svg>
  );
}

export function NotificationIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
