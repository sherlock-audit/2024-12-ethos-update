import { ReputationMarketError } from '@ethos/blockchain-manager';
import { TypeChain } from '@ethos/contracts';
import { useRevalidator } from '@remix-run/react';
import {
  type DefaultError,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { Interface, isError, type ContractTransactionResponse } from 'ethers';
import { ErrorDecoder } from 'ethers-decode-error';
import { useCallback } from 'react';
import { type SetRequired } from 'type-fest';

/**
 * Wrapper over useMutation that starts a transaction and shows a notification on success or error.
 */
export function useWithTxMutation<
  TData extends ContractTransactionResponse,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: SetRequired<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();

  const mutationFn = useCallback<
    NonNullable<UseMutationOptions<TData, TError, TVariables, TContext>['mutationFn']>
  >(
    async (variables) => {
      try {
        const tx = await options.mutationFn(variables);
        await tx.wait();
        // Refreshes page loaders in Remix.
        revalidator.revalidate();
        await queryClient.invalidateQueries();

        return tx;
      } catch (error) {
        if (!(error instanceof Error)) {
          console.error({
            message: 'Transaction failed',
            description: String(error),
          });

          throw error;
        }

        // If it's a custom error from the contract, throw it directly.
        if (error instanceof ReputationMarketError) {
          throw error;
        }

        // Otherwise, it's an unexpected blockchain error. Attempt to decode it.
        const decodedError = await parseContractError(error);
        throw decodedError;
      }
    },
    [options, revalidator, queryClient],
  );

  return useMutation({ ...options, mutationFn }, queryClient);
}

const errorDecoder = ErrorDecoder.create(
  // Most likely, this happens because privy is bundled with ethers v5 while we
  // depend on ethers v6. The error is harmless, so ignoring for now.
  //
  // @ts-expect-error Argument of type 'Interface[]' is not assignable to
  // parameter of type 'readonly (Fragment[] | JsonFragment[] | Interface)[]'.
  // Type 'Interface' is not assignable to type 'Fragment[] | JsonFragment[] |
  // Interface'. Type
  // 'import("/Users/.../ethos/node_modules/ethers/lib.esm/abi/interface").Interface'
  // is not assignable to type
  // 'import("/Users/.../ethos/node_modules/ethers/lib.commonjs/abi/interface").Interface'.
  // Property '#private' in type 'Interface' refers to a different member that
  // cannot be accessed from within type 'Interface'.ts(2345)
  Object.values(TypeChain.factories).map((factory) => new Interface(factory.abi)),
);

export class ActionCancelledByUserError extends Error {
  constructor() {
    super('Transaction cancelled by user');
  }
}

export async function parseContractError(err: Error) {
  if (isError(err, 'ACTION_REJECTED')) {
    return new ActionCancelledByUserError();
  }

  return await errorDecoder.decode(err);
}
