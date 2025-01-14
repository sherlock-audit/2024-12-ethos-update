import { type ProfileId } from '@ethos/blockchain-manager';
import { type Invitation } from '@prisma-pg/client';
import { prisma } from '../db.js';

export type PrismaInvitation = Invitation;

export async function getInvitesAcceptedBy(
  profileId: ProfileId,
  limit?: number,
): Promise<Invitation[]> {
  const invitesAccepted = await prisma.invitation.findMany({
    where: {
      senderProfileId: profileId,
      status: 'ACCEPTED',
    },
    take: limit,
  });

  return invitesAccepted;
}
