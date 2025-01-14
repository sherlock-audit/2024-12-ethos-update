import { Flex } from 'antd';
import { ContributorCTA } from '../contributor-mode/contributor-cta/contributor-cta';
import { FeedProfileCard } from './components/feed-profile-card.component';
import { NoProfileWidget } from './components/no-profile-widget.component';
import { RecentProfilesCard } from './components/recent-profiles-card.component';
import { useCurrentUser } from 'contexts/current-user.context';
import { useContributionStats } from 'hooks/api/echo.hooks';

export function FeedSidebar() {
  const { connectedProfile } = useCurrentUser();
  const { data: stats } = useContributionStats({
    profileId: connectedProfile?.id ?? -1,
  });

  return (
    <Flex vertical gap={24}>
      {connectedProfile ? (
        <>
          {stats && <ContributorCTA stats={stats} />}
          <FeedProfileCard />
        </>
      ) : (
        <NoProfileWidget />
      )}
      <RecentProfilesCard />
    </Flex>
  );
}
