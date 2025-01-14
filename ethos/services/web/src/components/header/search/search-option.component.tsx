import { css } from '@emotion/react';
import { type ActivityActor, fromUserKey } from '@ethos/domain';
import { shortenHash } from '@ethos/helpers';
import { Flex, Space, Typography } from 'antd';
import { UserAvatar } from 'components/avatar/avatar.component';

const { Text } = Typography;

const containerStyles = {
  common: css({
    width: '100%',
    marginBottom: 4,
  }),
  stale: css({ opacity: 0.5 }),
};

export function SearchOption({
  actor,
  isStale = false,
}: {
  actor: ActivityActor;
  isStale?: boolean;
}) {
  const target = fromUserKey(actor.userkey, true);
  let short = actor.name;

  if ('service' in target && actor.username) {
    short = `${target.service}/${actor.username}`;
  }
  if ('address' in target) {
    short = shortenHash(target.address);
  }

  return (
    <Flex
      align="middle"
      gap="small"
      css={[containerStyles.common, isStale ? containerStyles.stale : undefined]}
    >
      <UserAvatar actor={actor} showHoverCard={false} renderAsLink={false} />
      <Space direction="vertical" size={0}>
        <Text strong ellipsis={{ suffix: '' }}>
          {actor.name}
        </Text>
        {actor.name !== short && <Typography.Text type="secondary">{short}</Typography.Text>}
      </Space>
    </Flex>
  );
}
