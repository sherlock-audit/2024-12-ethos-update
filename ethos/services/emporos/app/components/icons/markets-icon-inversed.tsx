import Icon, { type CustomIconComponentProps } from './icon.tsx';

export function MarketsLogoSvgInversed() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="cutout">
          <rect width="100%" height="100%" fill="white" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M33.9453 11.1719H43.3984V37.8125H33.9453V34.8047H35.6641V16.7578H33.9453V11.1719ZM32.0117 16.7578V13.9648H22.5586V19.7656H24.2773V37.8125H22.5586V40.6055H32.0117V34.8047H30.293V16.7578H32.0117ZM20.625 16.7578V19.7656H18.9063V37.8125H20.625V43.3984H11.1719V16.7578H20.625Z"
            fill="black"
          />
        </mask>
      </defs>
      <rect width="100%" height="100%" rx="4" ry="4" fill="currentColor" mask="url(#cutout)" />
    </svg>
  );
}

export function MarketsIconInversed(props: Partial<CustomIconComponentProps>) {
  return <Icon component={MarketsLogoSvgInversed} {...props} />;
}
