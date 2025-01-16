import { type ActivityActor } from '@ethos/domain';
import { shortenHash } from '@ethos/helpers';
import { getAddress } from 'viem';
import { type MarketUserData } from '~/data.server/market-user.ts';
import { type MarketUser } from '~/types/user.ts';
import { fallbackAvatarUrl } from '~/utils/avatar.utils.ts';

export function mapMarketUserToPrivyUser(
  marketUser: NonNullable<Awaited<ReturnType<typeof MarketUserData.getById>>>,
  actor: ActivityActor | null,
): MarketUser {
  const address = getAddress(marketUser.embeddedWallet);

  return {
    address,
    avatarUrl: marketUser.avatarUrl ?? fallbackAvatarUrl(address),
    username: `@${marketUser.twitterUsername ?? 'UnknownUser'}`,
    name: marketUser.twitterName ?? shortenHash(address),
    createdDate: marketUser.createdAt,
    ethosInfo: {
      profileId: actor?.profileId,
      score: actor?.score ?? 0,
    },
  };
}
