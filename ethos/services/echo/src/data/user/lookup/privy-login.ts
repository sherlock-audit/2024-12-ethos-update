import { type Prisma } from '@prisma-pg/client';
import { type Address } from 'viem';
import { convert } from '../../conversion.js';
import { prisma } from '../../db.js';

export type PrivyLogin = Prisma.PrivyLoginGetPayload<true> & {
  connectedWallet: Address;
  embeddedWallet: Address;
  smartWallet: Address;
};

export async function getPrivyLoginById(id: string): Promise<PrivyLogin | null> {
  const privyLogin = await prisma.privyLogin.findUnique({
    where: {
      id,
    },
  });

  return privyLogin ? convert.toPrivyLogin(privyLogin) : null;
}

export async function getPrivyLoginByAddress(connectedWallet: Address): Promise<PrivyLogin | null> {
  const privyLogin = await prisma.privyLogin.findFirst({
    where: {
      connectedWallet,
    },
  });

  return privyLogin ? convert.toPrivyLogin(privyLogin) : null;
}

export const privyLogin = {
  getPrivyLoginById,
  getPrivyLoginByAddress,
};
