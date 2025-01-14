import { useMatches } from '@remix-run/react';
import { useMemo } from 'react';

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 */
export function useMatchesData<T>(id: string): T | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );

  return route?.data as T;
}
