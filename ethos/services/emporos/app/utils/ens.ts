import { normalize } from 'viem/ens';

/**
 * Pattern to validate domain format requiring:
 * - At least one character before the dot (e.g., "a.eth" is valid, ".eth" is not)
 * - A dot separator
 * - At least two characters after the dot (e.g., "akrom.eth" is valid, "akrom.e" is not)
 *
 * Valid examples: "akrom.eth", "a.eth", "hello.xyz"
 * Invalid examples: ".eth", "akrom.e", "akrom.", "akrometh"
 */
const VALID_DOMAIN_PATTERN = /^.+\..{2,}$/;

export function isValidENS(name: string): boolean {
  try {
    const normalized = normalize(name);

    return normalized.match(VALID_DOMAIN_PATTERN) !== null;
  } catch {
    return false;
  }
}
