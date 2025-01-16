import { css } from '@emotion/react';
import {
  fromUserKey,
  parseReviewMetadata,
  parseVouchMetadata,
  type ReviewMetadata,
  type VouchMetadata,
} from '@ethos/domain';
import { extractEchoErrorMessage } from '@ethos/echo-client';
import { formatEth } from '@ethos/helpers';
import { Button, Flex, Table, Tag, Typography, type TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { RelativeDateTime } from 'components/RelativeDateTime';
import { ActivityTypeIcon } from 'components/activity-cards/card-header-title.component';
import { CheckCircleOutline, SwapHorizIcon } from 'components/icons';
import { CenteredLottieLoader } from 'components/loading-wrapper/lottie-loader.component';
import { PersonWithAvatar } from 'components/person-with-avatar/person-with-avatar.component';
import { tokenCssVars } from 'config/theme';
import { useAddReview, useVouch } from 'hooks/api/blockchain-manager';
import { useMigrationActivities } from 'hooks/api/echo.hooks';
import { useScoreIconAndColor } from 'hooks/user/useScoreIconAndColor';

type Activity = NonNullable<ReturnType<typeof useMigrationActivities>['data']>['values'][number];

const PAGE_SIZE = 10;
const { Text } = Typography;

const styles = {
  cell: css({
    overflow: 'hidden',
    minWidth: 0,
  }),
  text: css({
    fontSize: tokenCssVars.fontSizeLG,
  }),
  title: css({
    color: tokenCssVars.colorPrimary,
  }),
  vouchTag: css({
    color: tokenCssVars.colorPrimary,
    fontSize: tokenCssVars.fontSize,
    marginRight: 0,
  }),
  vouchTagIcon: css({
    color: tokenCssVars.colorPrimary,
    marginRight: 8,
    fontSize: tokenCssVars.fontSizeLG,
  }),
  button: css({
    color: tokenCssVars.colorPrimary,
    paddingInline: 0,
  }),
  transferredTag: css({
    fontSize: tokenCssVars.fontSize,
  }),
  emptyText: css({
    height: 475,
  }),
};

export function MigrationTable({
  onlyTransferred = false,
  query = '',
}: {
  onlyTransferred?: boolean;
  query?: string;
}) {
  const [page, setPage] = useState(1);
  const { COLOR_BY_SCORE } = useScoreIconAndColor();
  const { mutate: addReview } = useAddReview();
  const { mutate: vouch } = useVouch();
  const { data, isPending, error } = useMigrationActivities(
    {
      query,
      onlyTransferred,
      pagination: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    },
    { throwOnError: false },
  );

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const columns: TableProps<Activity>['columns'] = [
    {
      key: 'receiver',
      title: 'Receiver',
      dataIndex: 'subject',
      ellipsis: true,
      width: 180,
      render(subject: Activity['subject']) {
        return <PersonWithAvatar actor={subject} avatarSize="small" nameSize="large" ellipsis />;
      },
    },
    {
      key: 'activity-and-title',
      title: 'Activity & Title',
      ellipsis: true,
      render(_, record) {
        return (
          <Flex gap={8} align="center">
            {record.type === 'vouch' ? (
              <Tag
                color={tokenCssVars.colorBgLayout}
                icon={<ActivityTypeIcon type={record.type} iconCss={styles.vouchTagIcon} />}
                css={styles.vouchTag}
              >
                {formatEth(record.data.deposited)}
              </Tag>
            ) : (
              <ActivityTypeIcon
                type={record.type}
                color={COLOR_BY_SCORE[record.data.score]}
                iconCss={styles.text}
              />
            )}

            <Text ellipsis={{ tooltip: true }} css={css([styles.text, styles.title])}>
              &ldquo;{record.data.comment.trim()}&rdquo;
            </Text>
          </Flex>
        );
      },
    },
    {
      key: 'description',
      title: 'Description',
      ellipsis: true,
      render(_, record) {
        const { description } =
          record.type === 'review'
            ? parseReviewMetadata(record.data.metadata)
            : parseVouchMetadata(record.data.metadata);

        return description ? (
          <Text ellipsis={{ tooltip: true }} css={styles.text}>
            {description.trim()}
          </Text>
        ) : null;
      },
    },
    {
      key: 'date',
      title: 'Date',
      dataIndex: 'timestamp',
      width: 100,
      render(ts: number) {
        return <RelativeDateTime timestamp={ts / 1000} verbose />;
      },
    },
    {
      key: 'action',
      title: 'Action',
      width: 140,
      render(_, record) {
        if (record.transferred) {
          return (
            <Tag color="success" icon={<CheckCircleOutline />} css={styles.transferredTag}>
              Transferred
            </Tag>
          );
        }

        return (
          <Button
            type="link"
            icon={<SwapHorizIcon />}
            css={styles.button}
            onClick={() => {
              const subject = fromUserKey(record.subject.userkey);

              // Type guard
              if ('profileId' in subject) {
                throw new Error('Cannot transfer to mainnet for profileId');
              }

              const parsedMetadata =
                record.type === 'review'
                  ? parseReviewMetadata(record.data.metadata)
                  : parseVouchMetadata(record.data.metadata);

              const metadata: ReviewMetadata | VouchMetadata = {
                description: parsedMetadata.description,
                importedFromTestnet: record.data.id,
              };

              if (record.type === 'review') {
                addReview({
                  subject,
                  score: record.data.score,
                  comment: record.data.comment,
                  metadata,
                });
              } else {
                vouch({
                  target: subject,
                  paymentAmount: formatEther(record.data.deposited),
                  comment: record.data.comment,
                  metadata,
                });
              }
            }}
          >
            Transfer
          </Button>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data?.values}
      rowKey={(record) => `${record.type}-${record.data.id}`}
      size="small"
      loading={{
        spinning: isPending,
        style: { height: '100%', maxHeight: '100%' },
        indicator: <CenteredLottieLoader size={34} fullHeight />,
      }}
      locale={{
        emptyText:
          (error ?? isPending) ? (
            <Flex align="center" justify="center">
              <div css={styles.emptyText} />
              {error ? `⚠️ ${extractEchoErrorMessage(error)}` : null}
            </Flex>
          ) : undefined,
      }}
      pagination={{
        current: page,
        onChange: setPage,
        total: data?.total,
        pageSize: PAGE_SIZE,
        showSizeChanger: false,
      }}
    />
  );
}
