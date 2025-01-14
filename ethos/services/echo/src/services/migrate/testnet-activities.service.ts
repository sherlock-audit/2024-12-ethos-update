import { getScoreValue, ScoreByValue } from '@ethos/blockchain-manager';
import {
  type ActivityActor,
  fromUserKey,
  X_SERVICE,
  type ReviewActivityInfo,
  type VouchActivityInfo,
} from '@ethos/domain';
import { notEmpty, type PaginatedResponse } from '@ethos/helpers';
import { type OmitDeep } from 'type-fest';
import { zeroAddress } from 'viem';
import { z } from 'zod';
import { gcpCloudStorageClient } from '../../common/net/google-cloud-storage/google-cloud-storage.client.js';
import { getActors } from '../activity/utility.js';
import { Service } from '../service.base.js';
import { ServiceError } from '../service.error.js';
import { type AnyRecord } from '../service.types.js';
import { validators } from '../service.validator.js';

const schema = z
  .object({
    query: z.string().min(1).trim().toLowerCase(),
  })
  .merge(validators.paginationSchema());

type Input = z.infer<typeof schema>;

type OmitKeysCommon = 'votes' | 'replySummary' | 'author' | 'events' | 'data.archived';
type ReviewActivity = OmitDeep<
  ReviewActivityInfo,
  OmitKeysCommon | 'data.author' | 'data.subject' | 'data.createdAt'
>;
type VouchActivity = OmitDeep<
  VouchActivityInfo,
  | OmitKeysCommon
  | 'data.activityCheckpoints'
  | 'data.authorAddress'
  | 'data.authorProfileId'
  | 'data.subjectProfileId'
  | 'data.unhealthy'
  | 'data.balance'
  | 'data.staked'
  | 'data.withdrawn'
>;
type Output = PaginatedResponse<ReviewActivity | VouchActivity>;

export class TestnetActivitiesService extends Service<typeof schema, Output> {
  validate(params: AnyRecord): Input {
    return this.validator(params, schema);
  }

  async execute({ query, pagination: { limit, offset } }: Input): Promise<Output> {
    const {
      identifierByProfileIdMap,
      profileIdToUserkeyMap,
      profileIdToActivities,
      reviewMap,
      vouchMap,
    } = await gcpCloudStorageClient.getMigrationData();

    const profileId = identifierByProfileIdMap[query];

    if (!profileId) {
      throw ServiceError.NotFound('Profile not found', { code: 'PROFILE_NOT_FOUND' });
    }

    // Sorting DESC by default
    const allActivityPointers = (profileIdToActivities[profileId] ?? []).sort(
      (a, b) => b.ts - a.ts,
    );
    const activityPointers = allActivityPointers.slice(offset, offset + limit);

    const rawActivities = activityPointers
      .map((pointer) => (pointer.type === 'review' ? reviewMap[pointer.id] : vouchMap[pointer.id]))
      .filter(notEmpty);

    function getVouchSubjectUserkey(profileId: number): string | undefined {
      const keys = profileIdToUserkeyMap[profileId];

      if (!keys) return;

      // Prefer Attestation userkey, otherwise pick the first one
      return keys.find((key) => key.startsWith(`service:${X_SERVICE}:`)) ?? keys[0];
    }

    const userkeys = rawActivities
      .map((activity) => {
        // Vouch
        if ('deposited' in activity) {
          return getVouchSubjectUserkey(activity.subjectProfileId);
        }

        // Review
        return activity.subjectUserkey;
      })
      .filter(notEmpty);

    const actors = await getActors(userkeys.map((userkey) => fromUserKey(userkey)));

    const actorsMap = new Map<string, ActivityActor>();

    for (const actor of actors) {
      actorsMap.set(actor.userkey, actor);
    }

    const values: Output['values'] = rawActivities.map((activity) => {
      if ('deposited' in activity) {
        const subjectUserkey = getVouchSubjectUserkey(activity.subjectProfileId);

        if (!subjectUserkey) {
          // this should never happen, so mostly a type guard
          this.logger.error({ data: { activity } }, 'Vouch subject userkey not found');

          throw ServiceError.InternalServerError('Vouch subject userkey not found');
        }

        const vouch: VouchActivity = {
          type: 'vouch',
          data: {
            id: activity.id,
            deposited: BigInt(activity.deposited),
            comment: activity.comment,
            metadata: activity.metadata,
          },
          subject: actorsMap.get(subjectUserkey) ?? placeholderActor(subjectUserkey),
          timestamp: new Date(activity.vouchedAt).valueOf(),
        };

        return vouch;
      }

      const review: ReviewActivity = {
        type: 'review',
        data: {
          id: activity.id,
          score: ScoreByValue[getScoreValue(activity.score)],
          comment: activity.comment,
          metadata: activity.metadata,
        },
        subject:
          actorsMap.get(activity.subjectUserkey) ?? placeholderActor(activity.subjectUserkey),
        timestamp: new Date(activity.createdAt).valueOf(),
      };

      return review;
    });

    return {
      values,
      total: allActivityPointers.length,
      limit,
      offset,
    };
  }
}

function placeholderActor(userkey: string): ActivityActor {
  return {
    userkey,
    name: '...',
    username: '',
    description: '',
    score: 0,
    avatar: null,
    primaryAddress: zeroAddress,
    scoreXpMultiplier: 1,
  };
}
