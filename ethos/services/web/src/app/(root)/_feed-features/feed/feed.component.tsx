import { css } from '@emotion/react';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FeedCard } from './components/feed-card.component';
import { FeedFilterOptions } from './components/feed-filter-options.component';
import { generateActivityItemUniqueKey } from './utils';
import { LoadingWrapper } from 'components/loading-wrapper/loading-wrapper.component';
import { CenteredLottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import { DEFAULT_PAGE_SIZE } from 'constant/constants';
import { useActivityVotes, useInfiniteFeed, voteLookup } from 'hooks/user/activities';

export function Feed() {
  const [minimumAuthorScore, setMinimumAuthorScore] = useState<number | undefined>(undefined);

  const {
    data,
    isPending: isRecentActivitiesPending,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteFeed(minimumAuthorScore, DEFAULT_PAGE_SIZE);

  const values = data?.values;
  const userVotes = useActivityVotes(voteLookup(values ?? [])).data;

  function handleFilterChange(newMinActorScore: number) {
    setMinimumAuthorScore(newMinActorScore);
  }

  return (
    <div>
      <FeedFilterOptions onFilterChange={handleFilterChange} />
      <LoadingWrapper
        type="skeletonCardList"
        isLoading={isRecentActivitiesPending}
        isEmpty={!values?.length}
      >
        <InfiniteScroll
          dataLength={values?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={<CenteredLottieLoader size={22} text="Loading" />}
          css={css`
            &.infinite-scroll-component {
              display: flex;
              flex-direction: column;
              gap: 25px;
              overflow: hidden !important;
            }
          `}
        >
          {values?.map((item) => (
            <FeedCard key={generateActivityItemUniqueKey(item)} item={item} userVotes={userVotes} />
          ))}
        </InfiniteScroll>
      </LoadingWrapper>
    </div>
  );
}
