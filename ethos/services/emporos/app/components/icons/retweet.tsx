import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function RetweetSvg() {
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 -960 960 960">
      <path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z" />
    </svg>
  );
}

export function RetweetIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={RetweetSvg} {...props} />;
}