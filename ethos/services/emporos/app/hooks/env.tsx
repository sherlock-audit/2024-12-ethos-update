import { type EthosEnvironment, isEnvironment } from '@ethos/env';
import { useMatchesData } from './use-match-data.ts';
import { type RootLoaderData } from '~/root.tsx';

export function useEnvironment(): EthosEnvironment {
  const data = useMatchesData<RootLoaderData>('root');

  if (!data || !isEnvironment(data.environment)) {
    throw new Error('No environment found in root loader.');
  }

  return data.environment;
}

export function getEnvironmentFromMatches(matches: Array<Record<string, any>>): EthosEnvironment {
  const rootMatch = matches.find((match) => match.id === 'root');

  if (!rootMatch?.data?.environment) {
    throw new Error('No environment found in root loader.');
  }

  return rootMatch.data?.environment;
}
