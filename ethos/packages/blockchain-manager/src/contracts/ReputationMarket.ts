import { type ContractLookup, type TypeChainCommon, TypeChain } from '@ethos/contracts';

import {
  type ErrorDescription,
  isCallException,
  type ContractRunner,
  type ContractTransactionResponse,
} from 'ethers';
import { getAddress, type Address } from 'viem';
import { type ProfileId } from '../types.js';

export class ReputationMarketError extends Error {
  reason: 'INSUFFICIENT_VOTES' | 'INSUFFICIENT_FUNDS' | 'SLIPPAGE_LIMIT_EXCEEDED' | 'UNKNOWN';

  constructor(reason: ReputationMarketError['reason'], message: string, error?: ErrorDescription) {
    super(message, { cause: error });
    this.reason = reason;
  }

  static fromErrorDescription(error: ErrorDescription): ReputationMarketError {
    switch (error.name) {
      case 'InsufficientVotesOwned':
        return new ReputationMarketError('INSUFFICIENT_VOTES', 'Insufficient votes owned', error);
      case 'InsufficientFunds':
        return new ReputationMarketError('INSUFFICIENT_FUNDS', 'Insufficient funds', error);
      case 'SlippageLimitExceeded':
        return new ReputationMarketError(
          'SLIPPAGE_LIMIT_EXCEEDED',
          'Slippage limit exceeded',
          error,
        );
      default: {
        return new ReputationMarketError('UNKNOWN', 'Unexpected error', error);
      }
    }
  }
}

type Market = {
  profileId: ProfileId;
  trustVotes: bigint;
  distrustVotes: bigint;
  basePrice: bigint;
  liquidityParameter: bigint;
};

export class ReputationMarket {
  public readonly address: Address;
  public readonly contractRunner: ContractRunner;
  public readonly contract: TypeChain.ReputationMarketAbi;

  constructor(runner: ContractRunner, contractLookup: ContractLookup) {
    this.address = contractLookup.reputationMarket.address;
    this.contractRunner = runner;
    this.contract = TypeChain.ReputationMarketAbi__factory.connect(this.address, runner);
  }

  async getVotePrice(profileId: number, isPositive: boolean): Promise<bigint> {
    return await this.contract.getVotePrice(profileId, isPositive);
  }

  async getUserVotes(
    user: Address,
    profileId: number,
  ): Promise<{ trustVotes: bigint; distrustVotes: bigint }> {
    return await this.contract.getUserVotes(user, profileId);
  }

  async createMarket(value: bigint): Promise<ContractTransactionResponse> {
    return await this.contract.createMarket({ value });
  }

  async calculateVotesToBuy(
    profileId: number,
    voteType: 'trust' | 'distrust',
    buyAmountWei: bigint,
    slippagePercentage: number,
    buyFeePercentage: number,
  ): Promise<{ minVotesToBuy: number; maxVotesToBuy: number }> {
    const market = await this.getMarket(profileId);

    const buyAmountMinusFees =
      buyAmountWei - (buyAmountWei * BigInt(buyFeePercentage * 100)) / BigInt(100);

    const M = Number(buyAmountMinusFees) / Number(market.basePrice);
    const b = Number(market.liquidityParameter);
    const Y = Number(market.trustVotes);
    const N = Number(market.distrustVotes);

    const expY = Math.exp(Y / b);
    const expN = Math.exp(N / b);
    const expM = Math.exp(M / b);

    let X;

    if (voteType === 'trust') {
      X = b * (Math.log(expM * (expY + expN) - expN) - Y / b);
    } else {
      X = b * (Math.log(expM * (expY + expN) - expY) - N / b);
    }

    let maxVotesToBuy: number;

    if (isNaN(X) || !isFinite(X)) {
      maxVotesToBuy = 0;
    } else {
      const roundedX = Math.ceil((X * 100) / 100);
      maxVotesToBuy = roundedX;
    }

    const minVotesToBuy = Math.floor(maxVotesToBuy * (1 - slippagePercentage));

    return {
      minVotesToBuy,
      maxVotesToBuy,
    };
  }

  async createMarketWithConfigAdmin(
    marketOwner: Address,
    marketConfigIndex: number,
    funds: bigint,
  ): Promise<ContractTransactionResponse> {
    return await this.contract.createMarketWithConfigAdmin(marketOwner, marketConfigIndex, {
      value: funds,
    });
  }

  async getMarketConfigs(): Promise<
    Array<{ configIndex: number; liquidity: bigint; creationCost: bigint; basePrice: bigint }>
  > {
    const marketConfigCount = await this.contract.getMarketConfigCount();

    const configs = await Promise.all(
      Array.from({ length: Number(marketConfigCount) }, async (_, i) => {
        const config = await this.contract.marketConfigs(i);

        return {
          configIndex: i,
          liquidity: config.liquidity,
          creationCost: config.creationCost,
          basePrice: config.basePrice,
        };
      }),
    );

    return configs;
  }

  async getBuyFeePercentage(): Promise<number> {
    const [entryProtocolBasisPoints, donationBasisPoints] = await Promise.all([
      this.contract.entryProtocolFeeBasisPoints(),
      this.contract.donationBasisPoints(),
    ]);

    return (Number(entryProtocolBasisPoints) + Number(donationBasisPoints)) / 10000;
  }

  async buyVotes(
    profileId: number,
    buyAmountWei: bigint,
    isPositive: boolean,
    maxVotesToBuy: number,
    minVotesToBuy: number,
  ): Promise<ContractTransactionResponse> {
    return await this.wrapErrors(this.contract.buyVotes, [
      profileId,
      isPositive,
      maxVotesToBuy,
      minVotesToBuy,
      {
        value: buyAmountWei,
      },
    ]);
  }

  async sellVotes(
    profileId: number,
    isPositive: boolean,
    amount: number,
    minimumVotePrice: bigint,
  ): Promise<ContractTransactionResponse> {
    return await this.wrapErrors(this.contract.sellVotes, [
      profileId,
      isPositive,
      amount,
      minimumVotePrice,
    ]);
  }

  async getMarket(profileId: number): Promise<Market> {
    const market = await this.contract.getMarket(profileId);

    return {
      profileId: Number(market.profileId),
      trustVotes: market.trustVotes,
      distrustVotes: market.distrustVotes,
      basePrice: market.basePrice,
      liquidityParameter: market.liquidityParameter,
    };
  }

  async simulateSell(
    profileId: number,
    isPositive: boolean,
    amount: number,
    address: Address,
  ): Promise<{
    proceedsBeforeFees: bigint;
    protocolFee: bigint;
    proceedsAfterFees: bigint;
    newVotePrice: bigint;
  }> {
    try {
      return await this.contract.simulateSell(profileId, isPositive, amount, { from: address });
    } catch (error) {
      const marketError = this.tryParseError(error);
      throw marketError;
    }
  }

  async simulateBuy(
    profileId: number,
    isPositive: boolean,
    votesToBuy: number,
  ): Promise<{
    purchaseCostBeforeFees: bigint;
    protocolFee: bigint;
    donation: bigint;
    totalCostIncludingFees: bigint;
    newVotePrice: bigint;
  }> {
    try {
      return await this.contract.simulateBuy(profileId, isPositive, BigInt(votesToBuy));
    } catch (error) {
      const marketError = this.tryParseError(error);
      throw marketError;
    }
  }

  async getParticipants(profileId: number, index: number): Promise<Address> {
    const participant = await this.contract.participants(profileId, index);

    return getAddress(participant);
  }

  async isParticipant(profileId: number, address: Address): Promise<boolean> {
    return await this.contract.isParticipant(profileId, address);
  }

  async getParticipantCount(profileId: number): Promise<bigint> {
    return await this.contract.getParticipantCount(profileId);
  }

  async setIsProfileAllowedToCreateMarket(
    profileId: number,
    isAllowed: boolean,
  ): Promise<ContractTransactionResponse> {
    return await this.contract.setUserAllowedToCreateMarket(profileId, isAllowed);
  }

  async getIsProfileAllowedToCreateMarket(profileId: number): Promise<boolean> {
    return await this.contract.isAllowedToCreateMarket(profileId);
  }

  private async wrapErrors<
    A extends any[] = any[],
    R = any,
    S extends TypeChainCommon.StateMutability = 'payable',
  >(
    method: TypeChainCommon.TypedContractMethod<A, R, S>,
    args: TypeChainCommon.ContractMethodArgs<A, S>,
  ): Promise<
    S extends 'view'
      ? Promise<TypeChainCommon.DefaultReturnType<R>>
      : Promise<ContractTransactionResponse>
  > {
    try {
      return await method(...args);
    } catch (error: any) {
      if (error.action === 'estimateGas') {
        try {
          // If it's an estimateGas error, it's likely that the custom revert data is not included.
          // So we need to perform a static call to ensure the custom revert data is included.
          await method.staticCall(...args);
          // The static call is expected to throw at this point.
          throw error;
        } catch (err) {
          throw this.tryParseError(err);
        }
      }
      throw this.tryParseError(error);
    }
  }

  private tryParseError(error: any): Error {
    if (!isCallException(error) || !error.data) {
      return error;
    }

    const parsedError = this.contract.interface.parseError(error.data);

    if (!parsedError) {
      return new Error('Unexpected error', { cause: error });
    }

    return ReputationMarketError.fromErrorDescription(parsedError);
  }
}
