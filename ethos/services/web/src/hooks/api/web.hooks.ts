import { getApi } from '@ethos/helpers';
import { useMutation } from '@tanstack/react-query';

const webApi = getApi();

export function useCreatePrivyLogin({
  onError,
  onSuccess,
}: { onError?: () => void; onSuccess?: () => void } = {}) {
  return useMutation({
    mutationFn: async () => {
      await webApi('/api/privy-logins', { method: 'POST' });
    },
    onError,
    onSuccess,
  });
}
