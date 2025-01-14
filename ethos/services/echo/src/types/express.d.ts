import { type LiteProfile } from '@ethos/domain';
import { type Logger } from '@ethos/logger';
import { type PrivyLogin } from '../data/user/lookup/privy-login.ts';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      logger: Logger;
      id: string;
      context: {
        privyUser?: {
          id: string;
          data?: PrivyLogin;
          profile?: LiteProfile;
        };
        twitterUserId?: string;
      };
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Response {
      responseTime?: number;
    }
  }
}

declare module 'express-session' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface SessionData {
    referrerTwitterUserId: string;
  }
}
