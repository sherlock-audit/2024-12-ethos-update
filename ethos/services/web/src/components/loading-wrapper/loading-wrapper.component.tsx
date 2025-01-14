import { type ReactNode } from 'react';
import { EmptyWrapper } from '../empty-wrapper/empty-wrapper.component';
import {
  SkeletonCard,
  SkeletonCardList,
  ThreeColumnSkeletonCardList,
  TwoColumnSkeletonCardList,
} from './components/skeleton-card.component';
import { SkeletonList } from './components/skeleton-list-component';
import { SkeletonTable } from './components/skeleton-table-component';
import { CenteredLottieLoader } from './lottie-loader.component';
import { ReloadableComponent } from 'components/reloadable-component/reloadable-component.compnent';

type LoadingType =
  | 'loading'
  | 'skeletonCard'
  | 'skeletonList'
  | 'skeletonCardList'
  | 'skeletonCardTwoColumnList'
  | 'skeletonCardThreeColumnList'
  | 'skeletonTable';

type SkeletonProps =
  | {
      type: 'skeletonList';
      size?: number;
    }
  | {
      type: 'skeletonTable';
      rows?: number;
      columns?: number;
      paginationCount?: number;
    }
  | {
      type: Exclude<LoadingType, 'skeletonTable' | 'skeletonList'>;
    };

type Props = SkeletonProps & {
  isLoading: boolean;
  isEmpty: boolean;
  emptyDescription?: string;
  reloadable?: boolean;
  children: ReactNode;
  contentType?: 'comment' | 'default';
};

const fallbacksByType: Record<
  Exclude<LoadingType, 'skeletonTable' | 'skeletonList'>,
  JSX.Element
> = {
  loading: <CenteredLottieLoader />,
  skeletonCard: <SkeletonCard />,
  skeletonCardList: <SkeletonCardList />,
  skeletonCardTwoColumnList: <TwoColumnSkeletonCardList />,
  skeletonCardThreeColumnList: <ThreeColumnSkeletonCardList />,
};

function getSkeleton(props: Props) {
  if (props.type === 'skeletonTable') {
    const { rows, columns, paginationCount } = props;

    return <SkeletonTable rows={rows} columns={columns} paginationCount={paginationCount} />;
  } else if (props.type === 'skeletonList') {
    const { size } = props;

    return <SkeletonList size={size} />;
  }

  return fallbacksByType[props.type];
}

export function LoadingWrapper(props: Props) {
  const { children, isLoading, isEmpty, emptyDescription, contentType, reloadable = true } = props;

  if (isLoading) {
    return getSkeleton(props);
  }

  return (
    <EmptyWrapper isEmpty={isEmpty} description={emptyDescription} contentType={contentType}>
      {reloadable ? <ReloadableComponent>{children}</ReloadableComponent> : children}
    </EmptyWrapper>
  );
}
