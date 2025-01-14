import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function ChevronLeftSvg() {
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

export function ChevronLeftIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={ChevronLeftSvg} {...props} />;
}
