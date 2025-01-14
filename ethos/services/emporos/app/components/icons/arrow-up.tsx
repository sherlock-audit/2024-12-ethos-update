import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function ArrowUpSvg() {
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
    </svg>
  );
}

export function ArrowUpIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={ArrowUpSvg} {...props} />;
}
