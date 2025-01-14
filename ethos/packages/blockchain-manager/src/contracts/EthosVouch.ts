import { type ContractLookup, TypeChain } from '@ethos/contracts';
import { type ContractRunner, type ContractTransactionResponse, toNumber } from 'ethers';
import { getAddress, type Hex, parseUnits, type Address } from 'viem';
import { type AttestationTarget, type Fees, type Vouch } from '../types.js';
import { hashServiceAndAccount } from './utils.js';

type VouchRaw = Awaited<ReturnType<TypeChain.VouchAbi['vouches']>>;

export class EthosVouch {
  public readonly address: Address;
  public readonly contractRunner: ContractRunner;
  public readonly contract: TypeChain.VouchAbi;

  constructor(runner: ContractRunner, contractLookup: ContractLookup) {
    this.address = contractLookup.vouch.address;
    this.contractRunner = runner;
    this.contract = TypeChain.VouchAbi__factory.connect(this.address, runner);
  }

  /**
   * Returns the number of vouches. Also, it's the same as the most recent vouch id.
   */
  async vouchCount(): Promise<number> {
    const vouchCount = await this.contract.vouchCount();

    return toNumber(vouchCount);
  }

  /**
   * Get vouch details.
   */
  async getVouch(id: number): Promise<Vouch | null> {
    const rawVouch = await this.contract.vouches(id);

    return this.formatRawVouch(rawVouch);
  }

  /**
   * Vouches for profile Id.
   * @param subjectProfileId Vouchee profile Id.
   * @param paymentAmount Payment amount. Must be equal to msg.value for native token.
   * @param comment Vouch title
   * @param metadata Optional metadata.
   */
  async vouchByProfileId(
    subjectProfileId: number,
    paymentAmount: string,
    comment: string,
    metadata?: string,
  ): Promise<ContractTransactionResponse> {
    const value = parseUnits(paymentAmount, 18);

    return await this.contract.vouchByProfileId(subjectProfileId, comment, metadata ?? '', {
      value,
    });
  }

  /**
   * Vouches for address, allowing vouches for addresses that have not yet joined Ethos, or
   * redirecting to a vouch by profileId if the address is registered.
   * @param voucheeAddress Vouchee address.
   * @param paymentAmount Payment amount. Must be equal to msg.value for native token.
   * @param comment Vouch title
   * @param metadata Optional metadata.
   */
  async vouchByAddress(
    subjectAddress: Address,
    paymentAmount: string,
    comment: string,
    metadata?: string,
  ): Promise<ContractTransactionResponse> {
    const value = parseUnits(paymentAmount, 18);

    return await this.contract.vouchByAddress(subjectAddress, comment, metadata ?? '', {
      value,
    });
  }

  /**
   * Vouches by attestation hash, allowing vouches for social accounts that have not yet joined Ethos, or
   * redirecting to a vouch by profileId if the attestation hash is registered.
   * @param attestationHash The attestation hash identifying the subject to vouch for
   * @param paymentAmount Payment amount. Must be equal to msg.value for native token.
   * @param comment Vouch title
   * @param metadata Optional metadata.
   */
  async vouchByAttestationHash(
    attestationHash: Hex,
    paymentAmount: string,
    comment: string,
    metadata?: string,
  ): Promise<ContractTransactionResponse> {
    const value = parseUnits(paymentAmount, 18);

    return await this.contract.vouchByAttestation(attestationHash, comment, metadata ?? '', {
      value,
    });
  }

  /**
   * Vouches by attestation service and account, allowing vouches for social accounts that have not yet joined Ethos, or
   * redirecting to a vouch by profileId if the attestation is registered.
   * @param service - The attestation service (e.g., 'x.com', 'github.com')
   * @param account - The account identifier for the attestation service (user id, username)
   * @param paymentAmount - Payment amount in ETH. Must be equal to msg.value for native token
   * @param comment - Vouch title
   * @param metadata - Optional metadata to include with the vouch
   * @returns A promise that resolves to the contract transaction response
   */
  async vouchByAttestation(
    attestation: AttestationTarget,
    paymentAmount: string,
    comment: string,
    metadata?: string,
  ): Promise<ContractTransactionResponse> {
    const value = parseUnits(paymentAmount, 18);
    const attestationHash = hashServiceAndAccount(attestation.service, attestation.account);

    return await this.contract.vouchByAttestation(attestationHash, comment, metadata ?? '', {
      value,
    });
  }

  /**
   * Unvouches vouch.
   */
  async unvouch(vouchId: number): Promise<ContractTransactionResponse> {
    return await this.contract.unvouch(vouchId);
  }

  /**
   * Unvouches vouch.
   */
  async unvouchUnhealthy(vouchId: number): Promise<ContractTransactionResponse> {
    return await this.contract.unvouchUnhealthy(vouchId);
  }

  /**
   * Returns all fee configurations from the contract
   */
  async getAllFees(): Promise<Fees> {
    const [
      entryProtocolFeeBasisPoints,
      exitFeeBasisPoints,
      entryDonationFeeBasisPoints,
      entryVouchersPoolFeeBasisPoints,
    ] = await Promise.all([
      this.contract.entryProtocolFeeBasisPoints(),
      this.contract.exitFeeBasisPoints(),
      this.contract.entryDonationFeeBasisPoints(),
      this.contract.entryVouchersPoolFeeBasisPoints(),
    ]);

    return {
      entryProtocolFeeBasisPoints,
      exitFeeBasisPoints,
      entryDonationFeeBasisPoints,
      entryVouchersPoolFeeBasisPoints,
    };
  }

  /**
   * Gets the rewards balance for a profile ID
   * @param profileId The profile ID to check rewards balance for
   * @returns The rewards balance
   */
  async getRewardsBalance(profileId: number): Promise<{ balance: string }> {
    const balance = await this.contract.rewardsByProfileId(profileId);

    return {
      balance: balance.toString(),
    };
  }

  /**
   * Withdraws all rewards
   * @returns The transaction response
   */
  async claimRewards(): Promise<ContractTransactionResponse> {
    // The contract only supports claiming all rewards at once via claimRewards()
    return await this.contract.claimRewards();
  }

  private formatRawVouch(vouch: VouchRaw): Vouch | null {
    const {
      archived,
      unhealthy,
      authorProfileId,
      authorAddress,
      vouchId,
      subjectProfileId,
      balance,
      comment,
      metadata,
      activityCheckpoints: { vouchedAt, unvouchedAt, unhealthyAt },
    } = vouch;

    return {
      id: toNumber(vouchId),
      archived: Boolean(archived),
      unhealthy: Boolean(unhealthy),
      authorProfileId: toNumber(authorProfileId),
      authorAddress: getAddress(authorAddress),
      subjectProfileId: toNumber(subjectProfileId),
      balance,
      comment,
      metadata,
      activityCheckpoints: {
        vouchedAt: toNumber(vouchedAt),
        unvouchedAt: toNumber(unvouchedAt),
        unhealthyAt: toNumber(unhealthyAt),
      },
    };
  }
}
