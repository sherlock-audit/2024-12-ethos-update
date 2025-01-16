import Icon from '@ant-design/icons';
import { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

function Svg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24" width="1em">
      <g>
        <path d="M0,0h24v24H0V0z" fill="none" />
      </g>
      <g>
        <path
          fill="currentColor"
          d="M12,2L4,5v6.09c0,5.05,3.41,9.76,8,10.91c4.59-1.15,8-5.86,8-10.91V5L12,2z M15.5,14.09l-1.41,1.41L12,13.42L9.91,15.5 L8.5,14.09L10.59,12L8.5,9.91L9.91,8.5L12,10.59l2.09-2.09l1.41,1.41L13.42,12L15.5,14.09z"
        />
      </g>
    </svg>
  );
}

export function GppBad(props: Partial<CustomIconComponentProps>) {
  return <Icon component={Svg} {...props} />;
}
