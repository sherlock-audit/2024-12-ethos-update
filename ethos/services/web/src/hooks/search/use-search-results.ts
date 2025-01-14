import { useDebouncedValue } from '@ethos/common-ui';
import { type ActivityActor } from '@ethos/domain';
import { useSearchQuery } from 'hooks/api/echo.hooks';

export function useSearchResults(searchValue: string) {
  const debouncedValue = useDebouncedValue(searchValue, 200, true);
  const { data, isFetching } = useSearchQuery(debouncedValue?.trim());

  const actors: ActivityActor[] = data?.values ?? [];
  const sortedActors = [...actors].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return {
    actors: sortedActors,
    isFetching,
    debouncedValue,
  };
}
