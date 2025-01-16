import { type Hash, isHash, zeroHash } from 'viem';

/**
 * Safely compares two hashes for equality
 */
export function isHashEqualSafe(a: Hash, b: Hash): boolean {
  try {
    return a.toLowerCase() === b.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Checks if the given hash is valid and not equal to the zero hash.
 *
 * @param hash The hash to check.
 * @returns True if the hash is valid and not equal to the zero hash.
 */
export function isValidHash(hash?: string | null): hash is Hash {
  if (!hash) return false;
  if (!isHash(hash)) return false;
  if (isHashEqualSafe(hash, zeroHash)) return false;

  return true;
}
