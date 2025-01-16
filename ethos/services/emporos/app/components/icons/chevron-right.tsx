import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function ChevronRightSvg() {
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

export function ChevronRightIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={ChevronRightSvg} {...props} />;
}
