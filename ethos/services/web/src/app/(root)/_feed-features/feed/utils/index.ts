import {
  type ActivityInfo,
  attestationActivity,
  invitationAcceptedActivity,
  reviewActivity,
  unvouchActivity,
  vouchActivity,
} from '@ethos/domain';

export function generateActivityItemUniqueKey(item: ActivityInfo): string {
  if (!item) return '';

  if (item.type === attestationActivity) {
    return `${item.data.service}-${item.data.account}`;
  }

  if (item.type === reviewActivity) {
    return `review-${item.data.id}`;
  }

  if (item.type === vouchActivity || item.type === unvouchActivity) {
    return `${item.type}-${item.data.id}`;
  }

  if (item.type === invitationAcceptedActivity) {
    return `invitation-accepted-${item.data.id}`;
  }

  return '';
}
