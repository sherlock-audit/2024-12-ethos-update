import { css } from '@emotion/react';
import {
  attestationActivity,
  reviewActivity,
  unvouchActivity,
  vouchActivity,
  type ActivityInfo,
} from '@ethos/domain';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { splitInTwo } from './helper';
import { TwoColumns } from './two-columns.component';
import { AttestationCard } from 'components/activity-cards/attestation.card.component';
import { ReviewCard } from 'components/activity-cards/review-card.component';
import { VouchCard } from 'components/activity-cards/vouch-card.component';
import { LoadingWrapper } from 'components/loading-wrapper/loading-wrapper.component';
import { CenteredLottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import {
  useActivityVotes,
  type useInfiniteUnifiedActivities,
  voteLookup,
} from 'hooks/user/activities';
import { type BulkVotes } from 'types/activity';

type Props = {
  queryResult: ReturnType<typeof useInfiniteUnifiedActivities>;
};

function renderData(data: ActivityInfo[], userVotes?: BulkVotes) {
  return data.map((item) => {
    if (item.type === attestationActivity) {
      return (
        <AttestationCard
          key={`${item.data.service}-${item.data.account}`}
          info={item}
          userVotes={userVotes}
        />
      );
    }

    if (item.type === reviewActivity) {
      return <ReviewCard key={`review-${item.data.id}`} info={item} userVotes={userVotes} />;
    }

    if (item.type === vouchActivity || item.type === unvouchActivity) {
      return <VouchCard key={`vouch-${item.data.id}`} info={item} userVotes={userVotes} />;
    }

    return null;
  });
}

export function RenderActivities({ queryResult }: Props) {
  const { data, isPending, fetchNextPage, hasNextPage } = queryResult;

  const activities = useMemo(() => data?.values ?? [], [data]);
  const userVotes = useActivityVotes(voteLookup(activities)).data;

  const { columnOne: columnOneData, columnTwo: columnTwoData } =
    splitInTwo<ActivityInfo>(activities);

  const columnOne = useMemo(() => renderData(columnOneData, userVotes), [columnOneData, userVotes]);

  const columnTwo = useMemo(() => renderData(columnTwoData, userVotes), [columnTwoData, userVotes]);
  const full = useMemo(() => renderData(activities, userVotes), [activities, userVotes]);

  return (
    <LoadingWrapper
      type="skeletonCardTwoColumnList"
      isLoading={isPending}
      isEmpty={!activities.length}
      emptyDescription="No activity yet"
    >
      <InfiniteScroll
        dataLength={activities?.length ?? 0}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<CenteredLottieLoader size={22} text="Loading" />}
        css={css`
          &.infinite-scroll-component {
            overflow: hidden !important;
          }
        `}
      >
        <TwoColumns columnOne={columnOne} columnTwo={columnTwo} full={full} />
      </InfiniteScroll>
    </LoadingWrapper>
  );
}
