import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function ArrowDownSvg() {
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="m20 12-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
    </svg>
  );
}

export function ArrowDownIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={ArrowDownSvg} {...props} />;
}
