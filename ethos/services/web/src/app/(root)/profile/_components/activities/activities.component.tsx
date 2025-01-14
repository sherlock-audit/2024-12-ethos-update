import { css } from '@emotion/react';
import {
  attestationActivity,
  invitationAcceptedActivity,
  reviewActivity,
  toUserKey,
  unvouchActivity,
  vouchActivity,
  type EthosUserTarget,
} from '@ethos/domain';
import { type UnifiedActivityRequest } from '@ethos/echo-client';
import { Flex, Select, Tabs, type TabsProps } from 'antd';
import { useMemo, useState } from 'react';
import { AllActivitiesTable } from './all-activities.table.component';
import { RenderActivities } from './render.component';
import { useInfiniteUnifiedActivities } from 'hooks/user/activities';

type Props = {
  target: EthosUserTarget;
};

export function Activities({ target }: Props) {
  const [orderBy, setOrderBy] = useState<UnifiedActivityRequest['orderBy']['field']>('votes');
  const [timeFilter, setTimeFilter] = useState<'all-time'>('all-time');

  const receivedQueryResult = useInfiniteUnifiedActivities({
    target: toUserKey(target),
    direction: 'subject',
    filter: [reviewActivity, vouchActivity],
    orderBy: { field: orderBy, direction: 'desc' },
    excludeHistorical: true,
    pagination: {
      limit: 20,
    },
  });

  const givenQueryResult = useInfiniteUnifiedActivities({
    target: toUserKey(target),
    direction: 'author',
    filter: [reviewActivity, vouchActivity],
    orderBy: { field: orderBy, direction: 'desc' },
    excludeHistorical: true,
    pagination: {
      limit: 20,
    },
  });

  const allQueryResult = useInfiniteUnifiedActivities({
    target: toUserKey(target),
    filter: [
      attestationActivity,
      invitationAcceptedActivity,
      reviewActivity,
      vouchActivity,
      unvouchActivity,
    ],
    orderBy: { field: orderBy, direction: 'desc' },
    pagination: {
      limit: 20,
    },
  });

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'received',
        label: `Received ${receivedQueryResult.data?.total ?? 0}`,
        children: <RenderActivities queryResult={receivedQueryResult} />,
      },
      {
        key: 'given',
        label: `Given ${givenQueryResult.data?.total ?? 0}`,
        children: <RenderActivities queryResult={givenQueryResult} />,
      },
      {
        key: 'all-activities',
        label: `All activity ${allQueryResult.data?.total ?? 0}`,
        children: <AllActivitiesTable queryResult={allQueryResult} />,
      },
    ],
    [receivedQueryResult, givenQueryResult, allQueryResult],
  );

  return (
    <Tabs
      defaultActiveKey={items[0].key}
      items={items}
      renderTabBar={(props, DefaultTabBar) => {
        return (
          <Flex vertical>
            <DefaultTabBar {...props} />
            <Flex
              css={css`
                padding-bottom: 16px;
              `}
              justify="flex-end"
            >
              <Flex gap={24}>
                <Select
                  css={css`
                    width: 128px;
                  `}
                  onChange={(value) => {
                    setTimeFilter(value);
                  }}
                  defaultValue={timeFilter}
                  options={[{ value: 'all-time', label: 'All Time' }]}
                />
                <Select
                  css={css`
                    width: 128px;
                  `}
                  onChange={(value) => {
                    setOrderBy(value);
                  }}
                  defaultValue={orderBy}
                  options={[
                    { value: 'votes', label: 'Top' },
                    { value: 'timestamp', label: 'Latest' },
                    { value: 'controversial', label: 'Controversial' },
                  ]}
                />
              </Flex>
            </Flex>
          </Flex>
        );
      }}
    />
  );
}
