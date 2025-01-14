import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback } from 'react';
import { cacheKeys } from 'constant/queries/queries.constant';
import { useContributorMode } from 'contexts/contributor-mode.context';
import { useCurrentUser } from 'contexts/current-user.context';
import { useContributionDaily, useContributionStats } from 'hooks/api/echo.hooks';

export function useInvalidateContributionQueries() {
  const queryClient = useQueryClient();
  const { connectedProfile } = useCurrentUser();

  const invalidateQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: cacheKeys.contribution.stats(connectedProfile?.id),
      }),
      queryClient.invalidateQueries({
        queryKey: cacheKeys.contribution.query(connectedProfile?.id, [
          'PENDING',
          'COMPLETED',
          'SKIPPED',
        ]),
      }),
    ]);
  }, [queryClient, connectedProfile?.id]);

  return invalidateQueries;
}

export function useInteractWithContributorMode() {
  const { connectedProfile } = useCurrentUser();
  const { setIsContributorModeOpen } = useContributorMode();
  const { data: stats } = useContributionStats({
    profileId: connectedProfile?.id ?? -1,
  });

  const { notification } = App.useApp();

  const invalidateQueries = useInvalidateContributionQueries();

  const { mutateAsync: contributionDaily } = useContributionDaily({
    onSuccess: async () => {
      await invalidateQueries();
      setIsContributorModeOpen(true);
    },
    onError: async () => {
      await invalidateQueries();
      notification.error({
        message: 'Failed to generate daily contributions',
      });
    },
  });

  const onInteract = useCallback(async () => {
    if (!connectedProfile) {
      notification.info({
        message: 'You need to have a profile to contribute',
      });

      return;
    }

    if (stats?.pendingCount === 0 && stats?.canGenerateDailyContributions) {
      await contributionDaily();
    } else {
      setIsContributorModeOpen(true);
    }
  }, [
    contributionDaily,
    setIsContributorModeOpen,
    stats?.pendingCount,
    stats?.canGenerateDailyContributions,
    connectedProfile,
    notification,
  ]);

  return onInteract;
}
