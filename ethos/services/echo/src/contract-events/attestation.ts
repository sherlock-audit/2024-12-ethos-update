import { hashServiceAndAccount, isAttestationService } from '@ethos/blockchain-manager';
import { type AttestationTypes } from '@ethos/contracts';
import { type EthosUserTarget } from '@ethos/domain';
import { getDateFromUnix } from '@ethos/helpers';
import { AttestationEventType, type Prisma } from '@prisma-pg/client';
import { blockchainManager } from '../common/blockchain-manager.js';
import { prisma } from '../data/db.js';
import { xpPointsHistory } from '../data/xp-points-history/index.js';
import { type EventProcessor, type WrangledEvent } from './event-processing.js';

type Payload = {
  attestationCreates: Prisma.AttestationCreateManyInput[];
  attestationUpdates: Prisma.AttestationUpdateManyArgs[];
  attestationEvents: Prisma.AttestationEventCreateManyInput[];
};

type EventUnion =
  | WrangledEvent<'AttestationCreated', AttestationTypes.AttestationCreatedEvent.LogDescription>
  | WrangledEvent<'AttestationArchived', AttestationTypes.AttestationArchivedEvent.LogDescription>
  | WrangledEvent<'AttestationClaimed', AttestationTypes.AttestationClaimedEvent.LogDescription>
  | WrangledEvent<'AttestationRestored', AttestationTypes.AttestationRestoredEvent.LogDescription>;

export const attestationEventProcessor: EventProcessor<EventUnion, Payload> = {
  ignoreEvents: new Set([]),
  getLogs: async (...args) => await blockchainManager.getAttestationEvents(...args),
  parseLog: (log) => blockchainManager.ethosAttestation.contract.interface.parseLog(log),
  eventWrangler: (parsed) => {
    switch (parsed.name) {
      case 'AttestationClaimed': {
        return {
          ...(parsed as unknown as AttestationTypes.AttestationClaimedEvent.LogDescription),
          name: parsed.name,
        };
      }
      case 'AttestationCreated': {
        return {
          ...(parsed as unknown as AttestationTypes.AttestationCreatedEvent.LogDescription),
          name: parsed.name,
        };
      }
      case 'AttestationArchived': {
        return {
          ...(parsed as unknown as AttestationTypes.AttestationArchivedEvent.LogDescription),
          name: parsed.name,
        };
      }
      case 'AttestationRestored': {
        return {
          ...(parsed as unknown as AttestationTypes.AttestationRestoredEvent.LogDescription),
          name: parsed.name,
        };
      }
    }

    return null;
  },
  preparePayload: async (events, logger) => {
    const attestationCreates = new Map<string, Prisma.AttestationCreateManyInput>();
    const attestationUpdates = new Map<string, Prisma.AttestationUpdateManyArgs>();
    const attestationEvents: Prisma.AttestationEventCreateManyInput[] = [];
    const dirtyScoreTargets: EthosUserTarget[] = [];

    for (const event of events) {
      const attestationHash = hashServiceAndAccount(
        event.wrangled.args.service,
        event.wrangled.args.account,
      );

      const attestationId = Number(event.wrangled.args.attestationId);

      const attestation =
        await blockchainManager.ethosAttestation.attestationByHash(attestationHash);

      if (!attestation) {
        logger.warn({ data: { attestationHash } }, 'attestation_not_found');
        continue;
      }

      dirtyScoreTargets.push({ profileId: attestation.profileId });

      attestationEvents.push({
        eventId: event.id,
        attestationId,
        type: eventTypeByEventName.get(event.wrangled.name),
      });

      switch (event.wrangled.name) {
        case 'AttestationCreated': {
          attestationCreates.set(attestationHash, {
            id: attestation.id,
            hash: attestation.hash,
            archived: attestation.archived,
            profileId: attestation.profileId,
            createdAt: getDateFromUnix(attestation.createdAt),
            account: attestation.account,
            service: attestation.service,
            evidence: event.wrangled.args.evidence,
          });

          break;
        }
        case 'AttestationClaimed':
        case 'AttestationRestored':
        case 'AttestationArchived':
          attestationUpdates.set(attestationHash, {
            data: {
              id: attestation.id,
              archived: attestation.archived,
              profileId: attestation.profileId,
              createdAt: getDateFromUnix(attestation.createdAt),
              account: attestation.account,
              service: attestation.service,
            },
            where: { hash: attestationHash },
          });
          break;
      }
    }

    return {
      payload: {
        attestationCreates: Array.from(attestationCreates.values()),
        attestationUpdates: Array.from(attestationUpdates.values()),
        attestationEvents: Array.from(attestationEvents.values()),
      },
      dirtyScoreTargets,
    };
  },
  submitPayload: async ({ attestationCreates, attestationUpdates, attestationEvents }) => {
    await prisma.$transaction([
      prisma.attestation.createMany({ data: attestationCreates }),
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      ...attestationUpdates.map((x) => prisma.attestation.updateMany(x)),
      prisma.attestationEvent.createMany({ data: attestationEvents }),
    ]);

    // The order here doesn't matter but Promise.all or prisma.$transaction
    // doesn't work (probably because I didn't return Prisma promise from that
    // function). DOing it sequentially for now. This will only be slow if we
    // replay all the events from blockchain.
    for (const a of attestationCreates) {
      if (isAttestationService(a.service)) {
        await xpPointsHistory.convertAttestationToProfileId(a.profileId, a.service, a.account);
      }
    }

    // Updating sequentially to ensure that if the account was disconnected from
    // one Ethos profile and connected to another one, XP history is correctly
    // re-assigned to a new profile.
    for (const a of attestationUpdates) {
      if (
        typeof a.data.service !== 'string' ||
        typeof a.data.account !== 'string' ||
        typeof a.data.profileId !== 'number' ||
        !isAttestationService(a.data.service)
      ) {
        return;
      }

      if (a.data.archived) {
        await xpPointsHistory.convertProfileIdToAttestation(
          a.data.profileId,
          a.data.service,
          a.data.account,
        );
      } else {
        await xpPointsHistory.convertAttestationToProfileId(
          a.data.profileId,
          a.data.service,
          a.data.account,
        );
      }
    }
  },
};

const eventTypeByEventName = new Map<string, AttestationEventType>([
  ['AttestationCreated', AttestationEventType.CREATE],
  ['AttestationClaimed', AttestationEventType.CLAIM],
  ['AttestationArchived', AttestationEventType.ARCHIVE],
  ['AttestationRestored', AttestationEventType.RESTORE],
]);
