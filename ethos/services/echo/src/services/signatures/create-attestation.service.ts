import { X_SERVICE } from '@ethos/domain';
import { isAddressEqualSafe } from '@ethos/helpers';
import { z } from 'zod';
import { config } from '../../common/config.js';
import { prisma } from '../../data/db.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';
import { type AnyRecord } from '../service.types.js';
import { validators } from '../service.validator.js';

const schema = z.object({
  service: z.enum([X_SERVICE]),
  connectedAddress: validators.address,
});

type Input = z.infer<typeof schema>;
type Output = {
  randValue: number;
  signature: string;
  account: string;
  evidence: string;
};

export class CreateAttestationSignature extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ connectedAddress, service }: Input): Promise<Output> {
    const { privyUser } = this.context();
    const privyLogin = privyUser?.data;
    const profileId = privyUser?.profile?.id;

    if (
      !privyLogin ||
      !profileId ||
      !isAddressEqualSafe(privyLogin.connectedWallet, connectedAddress)
    ) {
      throw ServiceError.Forbidden('Invalid Privy session');
    }

    const account = privyLogin.twitterUserId;

    if (!account) {
      throw ServiceError.Forbidden('No Twitter account connected');
    }

    const hasAttestation = await prisma.attestation.findFirst({
      where: {
        profileId,
        service,
        account,
        archived: false,
      },
    });

    if (hasAttestation) {
      throw ServiceError.BadRequest('Social account already connected', {
        fields: ['service', 'account'],
      });
    }

    const evidence = JSON.stringify({
      source: 'privy',
      type: 'OAuth2',
      id: privyLogin.id,
      approver: 'ethos.network',
    });

    const result = await this.blockchainManager.createSignatureForCreateAttestation(
      profileId,
      account,
      service,
      evidence,
      config.SIGNER_ACCOUNT_PRIVATE_KEY,
    );

    return {
      ...result,
      account,
      evidence,
    };
  }
}
