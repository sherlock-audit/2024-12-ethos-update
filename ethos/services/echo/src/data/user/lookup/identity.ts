import { type ProfileId, type Attestation } from '@ethos/blockchain-manager';
import { X_SERVICE, type EthosUserTarget } from '@ethos/domain';
import { isValidAddress, isValidHash, shortenHash } from '@ethos/helpers';
import { zeroAddress, zeroHash, type Address } from 'viem';
import { getDetailsByAddress } from '../../../common/net/ens.js';
import { prisma } from '../../db.js';
import { user } from './index.js';

type Result = {
  name: string | null;
  username: string | null;
  avatar: string | null;
  description: string | null;
};

export async function getAddressesAndAttestationsByTarget(target: EthosUserTarget): Promise<{
  addresses: Address[];
  attestations: Attestation[];
}> {
  const profile = await user.getProfile(target);

  const { addresses, attestations } = await getAddressesAndAttestationsByProfile(profile?.id);

  if ('address' in target && !addresses.includes(target.address)) {
    addresses.push(target.address);
  }

  return { addresses, attestations };
}

export async function getAddressesAndAttestationsByProfile(profileId?: ProfileId): Promise<{
  addresses: Address[];
  attestations: Attestation[];
}> {
  const attestations = profileId ? await user.getAttestations(profileId) : [];
  // pass in by profileid to avoid another lookup to find profileid :D
  const addresses = profileId ? (await user.getAddresses({ profileId })).allAddresses : [];

  return { addresses, attestations };
}

async function checkENS(addresses: Address[]): Promise<Result> {
  let result: Result = { avatar: null, name: null, username: null, description: null };

  for (const address of addresses) {
    const { avatar, name } = await getDetailsByAddress(address);

    // always use the first name or avatar that you find
    const found = {
      name,
      username: null,
      avatar,
      description: null,
    };
    result = updateIfNotSet(result, found);

    // once you have both, check out early
    if (result.name && result.avatar) break;
  }

  return result;
}

async function checkAttestations(attestations: Attestation[]): Promise<Result> {
  let result: Result = { avatar: null, name: null, username: null, description: null };

  for (const attestation of attestations) {
    // skip archived attestations
    if (attestation.archived) continue;
    if (attestation.service === X_SERVICE) {
      const twitterProfile = await prisma.twitterProfileCache.findUnique({
        where: {
          id: attestation.account,
        },
      });

      if (twitterProfile) {
        // always use the first name or avatar that you find
        const found = {
          name: twitterProfile.name ?? null,
          username: twitterProfile.username ?? null,
          avatar: twitterProfile.avatar ?? null,
          description: twitterProfile.biography ?? null,
        };
        result = updateIfNotSet(result, found);
      }
      // once you have all three, check out early
      if (result.name && result.avatar && result.description) break;
    }
  }

  return result;
}

async function checkServiceTarget(target: EthosUserTarget): Promise<Result> {
  const result: Result = { avatar: null, name: null, username: null, description: null };

  if ('service' in target && 'account' in target) {
    const twitterProfile = await prisma.twitterProfileCache.findUnique({
      where: {
        id: target.account,
      },
    });

    if (twitterProfile) {
      result.name = twitterProfile.name || twitterProfile.username || null;
      result.username = twitterProfile.username ?? null;
      result.avatar = twitterProfile.avatar ?? null;
      result.description = twitterProfile.biography ?? null;
    } else {
      // unable to find twitter profile - just concat service/account
      result.name = `${target.service}/${target.account}`;
    }
  }

  return result;
}

/**
 * Checks Moralis transaction history for address names and logos.
 * Moralis will include common names/logos for major protocols (ie Uniswap, OpenSea, etc).
 * These names and logos are unlikely to change so we use findFirst without ordering.
 *
 * @param addresses - Addresses pertaining to a single entity (ie, an ethos profile)
 * @returns A Promise resolving to a Result object containing name and avatar information.
 */
async function checkMoralis(addresses: Address[]): Promise<Result> {
  const result: Result = { avatar: null, name: null, username: null, description: null };

  for (const address of addresses) {
    const [moralisFrom, moralisTo] = await Promise.all([
      prisma.transactionHistoryCache.findFirst({
        select: {
          fromAddressLabel: true,
          fromAddressLogo: true,
        },
        where: {
          fromAddress: address,
        },
      }),
      prisma.transactionHistoryCache.findFirst({
        select: {
          toAddressLabel: true,
          toAddressLogo: true,
        },
        where: {
          toAddress: address,
        },
      }),
    ]);

    result.name = result.name ?? moralisFrom?.fromAddressLabel ?? moralisTo?.toAddressLabel ?? null;
    result.avatar =
      result.avatar ?? moralisFrom?.fromAddressLogo ?? moralisTo?.toAddressLogo ?? null;

    // once you have both, check out early
    if (result.name && result.avatar) break;
  }

  return result;
}

async function checkMockProfile(target: EthosUserTarget): Promise<Result> {
  const result: Result = { name: null, username: null, avatar: null, description: null };

  if ('profileId' in target) {
    // Look up attestation hash from vouches table
    const vouch = await prisma.vouch.findFirst({
      where: {
        subjectProfileId: target.profileId,
        OR: [{ attestationHash: { not: zeroHash } }, { subjectAddress: { not: zeroAddress } }],
      },
      select: { attestationHash: true, subjectAddress: true },
    });

    if (!vouch) return result;

    if (isValidHash(vouch?.attestationHash)) {
      // Look up Twitter profile using attestation hash
      const twitterProfile = await prisma.twitterProfileCache.findFirst({
        where: { attestationHash: vouch.attestationHash },
      });

      if (twitterProfile) {
        return {
          name: twitterProfile.name ?? null,
          username: twitterProfile.username ?? null,
          avatar: twitterProfile.avatar ?? null,
          description: twitterProfile.biography ?? null,
        };
      }
    }
    if (isValidAddress(vouch.subjectAddress)) {
      const addresses = [vouch.subjectAddress];

      // this duplicates code from getNameAvatarDescription, but the order matters; try everything else
      // BEFORE checking for mock profile details. It should be mutually exclusive, where you only
      // check for mock profile details if you didn't have any addresses to check earlier.
      if (await trySource(result, async () => await checkENS(addresses))) return result;
      if (await trySource(result, async () => await checkMoralis(addresses))) return result;
      if (addresses.length > 0 && !result.name) result.name = shortenHash(addresses[0]);
    }
  }

  return result;
}

// helper function that checks if result is all non-null
function isResultComplete(result: Result): boolean {
  return Object.values(result).every((value) => value !== null);
}

// helper function that only updates the results if there's not already an existing value
function updateIfNotSet(existing: Result, found: Result): Result {
  if (!existing.name && found.name) existing.name = found.name;
  if (!existing.username && found.username) existing.username = found.username;
  if (!existing.avatar && found.avatar) existing.avatar = found.avatar;
  if (!existing.description && found.description) existing.description = found.description;

  return existing;
}

async function trySource(result: Result, fn: () => Promise<Result>): Promise<boolean> {
  const sourceResult = await fn();
  Object.assign(result, updateIfNotSet(result, sourceResult));

  return isResultComplete(result);
}

export async function getNameAvatarDescription(target: EthosUserTarget): Promise<Result> {
  const result: Result = { name: null, username: null, avatar: null, description: null };

  const { addresses, attestations } = await getAddressesAndAttestationsByTarget(target);

  // Try each source in order until we get complete results
  if (await trySource(result, async () => await checkAttestations(attestations))) return result;
  if (await trySource(result, async () => await checkENS(addresses))) return result;
  if (await trySource(result, async () => await checkServiceTarget(target))) return result;
  if (await trySource(result, async () => await checkMoralis(addresses))) return result;
  if (await trySource(result, async () => await checkMockProfile(target))) return result;

  if (addresses.length > 0 && !result.name) result.name = shortenHash(addresses[0]);

  return result;
}
