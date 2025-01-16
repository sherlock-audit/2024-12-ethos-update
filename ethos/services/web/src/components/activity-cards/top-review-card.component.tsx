import { css } from '@emotion/react';
import { reviewContractName } from '@ethos/contracts';
import { parseReviewMetadata, type ReviewActivityInfo } from '@ethos/domain';
import { Flex, Typography, theme, Card, Tag, Tooltip } from 'antd';
import Title from 'antd/es/typography/Title';
import { upperFirst } from 'lodash-es';
import Link from 'next/link';
import { useArchiveReview } from '../../hooks/api/blockchain-manager';
import { UserAvatar } from '../avatar/avatar.component';
import { PersonName } from '../person-name/person-name.component';
import { CardFooter } from './card-footer.component';
import { TopActions } from './top-actions/top-actions.component';
import { RelativeDateTime } from 'components/RelativeDateTime';
import { Clickable } from 'components/activity-cards/clickable.component';
import { ExpandableParagraph } from 'components/expandable-paragraph/expandable-paragraph.component';
import { PreventInheritedLinkClicks } from 'components/prevent-inherited-link-clicks/prevent-inherited-link-clicks.component';
import { tokenCssVars } from 'config/theme';
import { useIsTargetCurrentUser } from 'contexts/current-user.context';
import { useThemeMode } from 'contexts/theme-manager.context';
import { useScoreIconAndColor } from 'hooks/user/useScoreIconAndColor';
import { type BulkVotes } from 'types/activity';
import { getActivityUrl } from 'utils/routing';
import { truncateTitle } from 'utils/truncate-title';

const { Paragraph, Text } = Typography;

type Props = {
  info: ReviewActivityInfo;
  userVotes?: BulkVotes;
};

export function TopReviewCard({ info, userVotes }: Props) {
  const { token } = theme.useToken();
  const mode = useThemeMode();
  const { data: review, votes, replySummary, author } = info;

  const isCurrentUser = useIsTargetCurrentUser({ address: review.author });
  const archiveReview = useArchiveReview();

  const { ICON_BY_SCORE } = useScoreIconAndColor(10);

  const reviewTitle = truncateTitle(review.comment);
  const { description } = parseReviewMetadata(review?.metadata);
  const safeTimestamp = Number.isFinite(review.createdAt) ? review.createdAt : Date.now();

  async function onWithdraw() {
    try {
      await archiveReview.mutateAsync(review.id);
    } catch (error) {
      console.error('Failed to archive review', error);
    }
  }

  const bgUrl = `/assets/images/top-review-background${mode === 'dark' ? '-dark' : ''}.svg`;

  return (
    <Card
      css={css`
        flex: 1;
        min-height: 240px;

        & .ant-card-body {
          height: 100%;
          padding: ${token.padding}px;
        }
      `}
    >
      <Clickable link={getActivityUrl(info)}>
        <Flex
          vertical
          justify="space-between"
          css={css`
            height: 100%;
          `}
        >
          <Flex gap={14} vertical>
            <Flex gap={12} align="center">
              <PreventInheritedLinkClicks>
                <UserAvatar size="large" actor={author} />
              </PreventInheritedLinkClicks>
              <Flex justify="space-between" flex={1} align="flex-start">
                <Flex vertical gap={8} align="flex-start">
                  <PreventInheritedLinkClicks>
                    <PersonName
                      ellipsis={true}
                      target={author}
                      weight="bold"
                      size="large"
                      color="colorText"
                      maxWidth="200px"
                    />
                  </PreventInheritedLinkClicks>
                  <Flex align="center">
                    <Tooltip title={`${upperFirst(review.score)} review`}>
                      <Tag
                        icon={ICON_BY_SCORE[review.score]}
                        color={tokenCssVars.colorBgLayout}
                        css={css`
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          width: 1.25rem;
                          height: 1.25rem;
                          flex-shrink: 0;
                        `}
                      />
                    </Tooltip>
                    <Text
                      type="secondary"
                      css={css`
                        font-size: 14px;
                      `}
                    >
                      {upperFirst(review.score)} review
                    </Text>
                  </Flex>
                </Flex>
                <Flex
                  gap={4}
                  align="center"
                  css={css`
                    margin-top: -3px;
                  `}
                >
                  <Link href={getActivityUrl(info)}>
                    <Text
                      css={css`
                        color: ${tokenCssVars.colorTextTertiary};
                      `}
                    >
                      <RelativeDateTime
                        dateTimeFormat={{ dateStyle: 'long', timeStyle: 'short' }}
                        timestamp={safeTimestamp}
                      />
                    </Text>
                  </Link>
                  <PreventInheritedLinkClicks>
                    <TopActions
                      onWithdraw={isCurrentUser ? onWithdraw : undefined}
                      pathname={getActivityUrl(info)}
                      txnHash={info.events[0].txHash}
                    />
                  </PreventInheritedLinkClicks>
                </Flex>
              </Flex>
            </Flex>

            <Flex
              vertical
              css={css`
                background-image: url(${bgUrl});
                background-repeat: no-repeat;
                background-position: top right;
              `}
            >
              <Paragraph>
                <Title
                  css={css`
                    margin-top: 20px;
                    margin-bottom: 20px;
                  `}
                  level={4}
                >
                  &ldquo;{reviewTitle}&rdquo;
                </Title>
              </Paragraph>

              {description ? (
                <PreventInheritedLinkClicks>
                  <ExpandableParagraph rows={1}>{description}</ExpandableParagraph>
                </PreventInheritedLinkClicks>
              ) : null}
            </Flex>
          </Flex>
          <PreventInheritedLinkClicks>
            <CardFooter
              targetId={review.id}
              targetContract={reviewContractName}
              votes={votes}
              replySummary={replySummary}
              currentVote={userVotes?.review[review.id]?.userVote ?? null}
              pathname={getActivityUrl(info)}
            />
          </PreventInheritedLinkClicks>
        </Flex>
      </Clickable>
    </Card>
  );
}
