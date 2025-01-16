import { echoUrlMap } from '@ethos/env';
import {
  type ProfileWithMetaData,
  Strategy,
  type StrategyOptionsWithRequest,
} from '@superfaceai/passport-twitter-oauth2';
import { type Request } from 'express';
import { config } from '../common/config.js';

const options = {
  clientType: 'confidential',
  clientID: config.TWITTER_CLIENT_ID,
  clientSecret: config.TWITTER_CLIENT_SECRET,
  callbackURL: `${echoUrlMap[config.ETHOS_ENV]}/api/v1/claim/twitter/callback`,
  scope: ['tweet.read'], // This is required for /users/me endpoint. users:read is already included by the strategy
  passReqToCallback: true,
} as const satisfies StrategyOptionsWithRequest;

export const TwitterStrategy = new Strategy(
  options,
  (
    _req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: ProfileWithMetaData,
    done: (err: unknown, user: Express.User) => void,
  ) => {
    done(null, profile);
  },
);
