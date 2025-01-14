import { echoUrlMap, webUrlMap } from '@ethos/env';
import { duration } from '@ethos/helpers';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import passport from 'passport';
import { config } from '../common/config.js';
import { ExpressError } from '../common/errors/express-error.js';
import { redis } from '../data/redis.js';
import { initChaosMiddleware } from './chaos.js';
import { logger } from './logger.js';
import { RouteFlags } from './route.flags.js';
import { TwitterStrategy } from './twitter-oauth2.js';

const DEFAULT_TIMEOUT = duration(30, 'seconds').toMilliseconds();
const isLocal = config.ETHOS_ENV === 'local';
const routeFlags = new RouteFlags();
const redisStore = new RedisStore({ client: redis, prefix: 'session:' });

passport.use(TwitterStrategy);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export function initMiddlewares(app: Express): void {
  Sentry.setupExpressErrorHandler(app);

  if (!isLocal) {
    // This is required by express-session, otherwise it doesn't set cookie
    // because we are behind Cloudflare proxy.
    app.set('trust proxy', 1);
  }

  app
    .use(helmet())
    .use(
      cors((req, callback) => {
        const origin = req.header('Origin');

        // Include cookies only for the web and echo origins
        if ([webUrlMap[config.ETHOS_ENV], echoUrlMap[config.ETHOS_ENV]].some((o) => o === origin)) {
          callback(null, { origin: true, credentials: true });
        } else {
          callback(null);
        }
      }),
    )
    .use(express.json())
    .use(logger)
    .use(routeFlags.authorize())
    .use(passport.initialize())
    // Session, used during the Twitter OAuth2 flow
    .use(
      session({
        secret: config.TWITTER_SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
          maxAge: duration(1, 'hour').toMilliseconds(),
          secure: !isLocal,
          httpOnly: true,
        },
        store: redisStore,
      }),
    )
    .use((req: Request, res: Response, next: NextFunction) => {
      req.context = {};

      req.setTimeout(DEFAULT_TIMEOUT, () => {
        const err = new ExpressError('Request Timeout', {
          code: 'REQUEST_TIMEOUT',
          expose: true,
          status: 408,
        });

        next(err);
      });

      res.setTimeout(DEFAULT_TIMEOUT, () => {
        const err = new ExpressError('Service Unavailable', {
          code: 'SERVICE_UNAVAILABLE',
          expose: true,
          status: 503,
        });

        next(err);
      });

      next();
    })
    // Make sure our responses are properly gzipped
    .use(compression());

  if (config.NODE_ENV === 'development') {
    initChaosMiddleware(app, config.CHAOS_PERCENTAGE_RATE);
  }
}
