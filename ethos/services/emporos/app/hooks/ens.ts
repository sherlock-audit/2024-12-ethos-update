import { getApi } from '@ethos/helpers';
import { useQuery } from '@tanstack/react-query';
import { type loader as ensDetailsByNameLoader } from '~/routes/api.ens-by-name.ts';

const request = getApi();

export function useEnsDetailsByName(ensName: string | undefined) {
  return useQuery({
    queryKey: ['ensDetailsByName', ensName],
    queryFn: async () => {
      if (!ensName) return null;
      const response = await request<Awaited<ReturnType<typeof ensDetailsByNameLoader>>>(
        `/api/ens-by-name?ensName=${ensName}`,
      );

      return response;
    },
    enabled: Boolean(ensName),
  });
}
