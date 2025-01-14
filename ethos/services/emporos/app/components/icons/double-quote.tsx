import Icon, { type CustomIconComponentProps } from './icon.tsx';

function DoubleQuoteSvg() {
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M11 9.16V2c-5 .5-9 4.79-9 10s4 9.5 9 10v-7.16c-1-.41-2-1.52-2-2.84s1-2.43 2-2.84zM14.86 11H22c-.48-4.75-4-8.53-9-9v7.16c1 .3 1.52.98 1.86 1.84zM13 14.84V22c5-.47 8.52-4.25 9-9h-7.14c-.34.86-.86 1.54-1.86 1.84z" />
    </svg>
  );
}

export function DoubleQuoteIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={DoubleQuoteSvg} {...props} />;
}
