import { css } from '@emotion/react';
import { type ContributionStats } from '@ethos/domain';
import { Badge, Button, Card, Flex, theme, Typography } from 'antd';
import { ContributorWingLeftSvg } from '../illustration/contributor-wing-left.svg';
import { ContributionStreaks } from './contribution-streaks';
import { ContributorIcon } from './contributor-icon';
import { getContributorState } from './getContributorDetails';
import { useInteractWithContributorMode, useInvalidateContributionQueries } from './hooks';
import { tokenCssVars } from 'config/theme';
import { useCurrentUser } from 'contexts/current-user.context';
import { useThemeMode } from 'contexts/theme-manager.context';

const bgWingStyle = css`
  font-size: 48px;
  color: ${tokenCssVars.colorText};
  position: absolute;
  pointer-events: none;
  top: 25px;
  opacity: 0.08;
`;

export function ContributorCTA({ stats }: { stats: ContributionStats }) {
  const { token } = theme.useToken();
  const mode = useThemeMode();
  const onInteract = useInteractWithContributorMode();
  const invalidateQueries = useInvalidateContributionQueries();

  const {
    title,
    status,
    description,
    ribbonText,
    buttonText,
    descriptionAfter,
    descriptionBefore,
  } = getContributorState({ stats, onTimeout: invalidateQueries, mode });

  const { connectedProfile } = useCurrentUser();

  const displayStreak = status === 'completed' || status === 'contribute';

  if (!connectedProfile?.id) return null;

  return (
    <Badge.Ribbon
      text={
        <Typography.Text css={{ color: tokenCssVars.colorBgContainer, fontWeight: 400 }}>
          {ribbonText}
        </Typography.Text>
      }
    >
      <Card
        bordered={false}
        css={{ position: 'relative' }}
        styles={{
          body: {
            paddingBlock: 25,
          },
        }}
      >
        <ContributorWingLeftSvg
          css={css`
            ${bgWingStyle}
            left: calc(50% - 150px);
            @media (min-width: ${token.screenMD}px) {
              left: max(3%, 10px);
            }
          `}
        />
        <ContributorWingLeftSvg
          css={css`
            ${bgWingStyle}
            right: calc(50% - 150px);
            transform: scaleX(-1); // flip horizontally
            @media (min-width: ${token.screenMD}px) {
              right: max(3%, 10px);
            }
          `}
        />
        <Flex vertical align="center" gap={14}>
          <Flex vertical align="center" gap={4}>
            <ContributorIcon
              variant={displayStreak ? 'streak' : 'icon'}
              currentStreakDay={stats.streakDaysOptimistic}
            />
            <Typography.Title
              level={3}
              css={{
                color: tokenCssVars.colorPrimary,
                whiteSpace: 'wrap',
                letterSpacing: '0.48px',
              }}
            >
              {title}
            </Typography.Title>
            <Flex vertical align="center" justify="center" gap={2}>
              {descriptionBefore}
              <Typography.Text
                css={{
                  color: mode === 'light' ? tokenCssVars.colorText : '#C1C0B6D9', // color does not exist in our theme
                  maxWidth: 134,
                  textAlign: 'center',
                }}
              >
                {description}
              </Typography.Text>
              {descriptionAfter}
            </Flex>
          </Flex>
          <Button
            type={status === 'completed' ? 'default' : 'primary'}
            data-status={status}
            css={css`
              padding: 16px;
              border-radius: 6px;
              color: ${tokenCssVars.colorBgContainer};
              &[data-status='completed'] {
                background-color: ${mode === 'light' ? '#bdbdb6' : '#44443F'};
                color: ${tokenCssVars.colorText};
                min-width: 88px;
              }
            `}
            onClick={onInteract}
          >
            {buttonText}
          </Button>
          {displayStreak ? (
            <ContributionStreaks currentStreakDay={stats.streakDaysOptimistic} />
          ) : null}
        </Flex>
      </Card>
    </Badge.Ribbon>
  );
}
