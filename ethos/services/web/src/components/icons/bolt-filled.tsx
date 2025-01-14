import Icon from '@ant-design/icons';
import { type CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { BoltFilledSvg } from './bolt-filled.svg';

export function BoltFilledIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={BoltFilledSvg} {...props} />;
}
