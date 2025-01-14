import { getAddress } from 'viem';
import { mapMarketUserToPrivyUser } from './middlware.utils.ts';
import { MarketUserData } from '~/data.server/market-user.ts';
import { getActor } from '~/services.server/echo.ts';
import { verifyPrivyAuthToken } from '~/services.server/privy-client.ts';
import { getPrivyTokensFromRequest } from '~/session.server.ts';
import { type MarketUser } from '~/types/user.ts';

/**
 * Gets the privy id token from the request and returns the corresponding market user if exists.
 *
 * @returns {Promise<MarketUser | null>} The privy user or null if the user is not found
 *
 */
export async function getPrivyUser(request: Request): Promise<MarketUser | null> {
  const { privyIdToken } = await getPrivyTokensFromRequest(request);

  const verifiedClaims = await verifyPrivyAuthToken(privyIdToken);

  if (!verifiedClaims) {
    return null;
  }

  const user = await MarketUserData.getById(verifiedClaims.userId);

  if (!user) {
    return null;
  }

  const actor = await getActor({ address: getAddress(user.embeddedWallet) });

  return mapMarketUserToPrivyUser(user, actor);
}
