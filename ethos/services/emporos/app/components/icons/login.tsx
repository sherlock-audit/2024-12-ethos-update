import Icon, { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

function LoginSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="1em"
      width="1em"
      viewBox="0 -960 960 960"
      fill="currentColor"
    >
      <path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z" />
    </svg>
  );
}

export function LoginIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={LoginSvg} {...props} />;
}