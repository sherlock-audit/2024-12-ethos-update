import { useMemo } from 'react';
import { isStandalonePWA } from 'ua-parser-js/helpers';

export function useIsPWA() {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return isStandalonePWA();
  }, []); // Empty deps array since window and isStandalonePWA are stable
}
