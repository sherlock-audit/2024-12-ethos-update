import { type PropsWithChildren, type ReactNode } from 'react';
import { useIsPWA } from 'hooks/use-is-pwa';

/**
 * Exclude PWA middleware.
 *
 * This is used to prevent banners like "This person has 90% positive" reviews for
 * showing up in the event that the user is using PWA.
 *
 */
export function ExcludePwaMiddleware({ children }: PropsWithChildren): ReactNode {
  const isPwa = useIsPWA();

  if (isPwa) {
    return null;
  }

  return children;
}
