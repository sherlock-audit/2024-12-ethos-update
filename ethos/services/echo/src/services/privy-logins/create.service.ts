import { hashServiceAndAccount } from '@ethos/blockchain-manager';
import { X_SERVICE } from '@ethos/domain';
import { type Prisma } from '@prisma-pg/client';
import { type TwitterOAuthWithMetadata } from '@privy-io/server-auth';
import { z } from 'zod';
import { privy } from '../../common/net/privy.client.js';
import { prisma } from '../../data/db.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';
import { type AnyRecord } from '../service.types.js';
import { TwitterUser } from '../twitter/user.service.js';

const schema = z.object({
  privyIdToken: z.string(),
});

type Input = z.infer<typeof schema>;

export class CreatePrivyLogin extends Service<typeof schema, undefined> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ privyIdToken }: Input): Promise<undefined> {
    const { privyUser } = this.context();

    if (!privyUser) {
      throw ServiceError.Unauthorized('Missing privy user');
    }

    const user = await privy.getUser({ idToken: privyIdToken }).catch((err) => {
      this.logger.error({ err }, 'get_user_error');

      throw ServiceError.Unauthorized('Invalid privy ID token');
    });

    if (user.id !== privyUser.id) {
      throw ServiceError.Forbidden('Invalid user');
    }

    const wallets = user.linkedAccounts.filter((a) => a.type === 'wallet');
    const connectedWallets = wallets.filter((w) => w.walletClientType !== 'privy');
    const [connectedWallet] = connectedWallets;
    const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
    const smartWallet = user.linkedAccounts.find((a) => a.type === 'smart_wallet');
    const twitterUser = user.linkedAccounts.find((a) => a.type === 'twitter_oauth');

    if (!embeddedWallet || !smartWallet || connectedWallets.length !== 1) {
      this.logger.warn({ data: { user } }, 'missing_linked_accounts');

      throw ServiceError.Forbidden('Invalid linked accounts');
    }

    const data: Prisma.PrivyLoginCreateArgs['data'] = {
      id: user.id,
      connectedWallet: connectedWallet.address,
      embeddedWallet: embeddedWallet.address,
      smartWallet: smartWallet.address,
      twitterUserId: twitterUser?.subject ?? null,
    };

    await prisma.privyLogin.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });

    if (twitterUser) {
      await this.updateTwitterUserCache(twitterUser);
    }
  }

  private async updateTwitterUserCache(twitterUser: TwitterOAuthWithMetadata): Promise<void> {
    if (!twitterUser.username) {
      this.logger.warn({ data: { twitterUser } }, 'missing_twitter_username');

      return;
    }

    const cached = await this.useService(TwitterUser)
      .run({ username: twitterUser.username })
      .catch(() => null);

    if (!cached) {
      const attestationHash = hashServiceAndAccount(X_SERVICE, twitterUser.subject);
      const data: Prisma.TwitterProfileCacheCreateArgs['data'] = {
        id: twitterUser.subject,
        username: twitterUser.username,
        name: twitterUser.name ?? 'Unknown',
        avatar: twitterUser.profilePictureUrl,
        attestationHash,
      };

      await prisma.twitterProfileCache.upsert({
        create: data,
        update: data,
        where: { id: data.id },
      });
    }
  }
}
