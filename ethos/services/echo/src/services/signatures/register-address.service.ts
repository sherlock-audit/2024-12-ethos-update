import { isAddressEqualSafe } from '@ethos/helpers';
import { z } from 'zod';
import { config } from '../../common/config.js';
import { user } from '../../data/user/lookup/index.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';

const schema = z.void();

type Input = z.infer<typeof schema>;
type Output = {
  randValue: number;
  signature: string;
};

export class RegisterAddressSignature extends Service<typeof schema, Output> {
  validate(): Input {}

  async execute(): Promise<Output> {
    const { privyUser } = this.context();
    const privyLogin = privyUser?.data;
    const profileId = privyUser?.profile?.id;

    if (!privyLogin || !profileId) {
      throw ServiceError.Forbidden('No Ethos profile');
    }

    const profileAddress = await user.getAddresses({ profileId });

    // Ensure the wallet is not already connected to the profile.
    const isWalletAlreadyConnected = profileAddress.allAddresses.some((address) =>
      isAddressEqualSafe(address, privyLogin.smartWallet),
    );

    if (isWalletAlreadyConnected) {
      throw ServiceError.BadRequest('Wallet already connected to the profile');
    }

    /**
     * ! Warning: this code is security critical. This creates a signature that grants access to the user's profile given an arbitrary address.
     * We trust privy authentication to ensure only addresses that the user has
     * registered as a smart wallet may be registered this way.
     * Do not change this code without considering the implications of changing this trust.
     */
    const { randValue, signature } = await this.blockchainManager.createSignatureForRegisterAddress(
      profileId,
      privyLogin.smartWallet,
      config.SIGNER_ACCOUNT_PRIVATE_KEY,
    );

    return {
      randValue,
      signature,
    };
  }
}
