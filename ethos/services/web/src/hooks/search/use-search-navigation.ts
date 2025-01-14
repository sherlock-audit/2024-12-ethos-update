import { fromUserKey } from '@ethos/domain';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getRouteTo } from 'hooks/user/hooks';

export function useNavigateToUserkeyProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function navigateToUserkeyProfile(userkey: string) {
    const target = fromUserKey(userkey);
    const targetRouteTo = await getRouteTo(queryClient, target);
    router.push(targetRouteTo.profile);
  }

  return {
    navigateToUserkeyProfile,
  };
}
