import { type ClaimError, claimErrors } from '@ethos/domain';
import { webUrlMap } from '@ethos/env';
import { duration } from '@ethos/helpers';
import { type ProfileWithMetaData } from '@superfaceai/passport-twitter-oauth2';
import cookie from 'cookie';
import { type NextFunction, type Request, type Response } from 'express';
import passport from 'passport';
import { config } from '../common/config.js';
import { redis } from '../data/redis.js';
import { AcceptedReferralsService } from '../services/claim/accepted-referrals.service.js';
import { ClaimStatsService } from '../services/claim/claim-stats.service.js';
import {
  ClaimXpService,
  REFERRAL_LIMIT_REACHED,
  REFERRER_NOT_FOUND,
} from '../services/claim/claim-xp.service.js';
import { ResetClaim } from '../services/claim/reset-claim.service.js';
import { ServiceError } from '../services/service.error.js';
import { Route } from './route.base.js';
import { RouteError } from './route.error.js';

const SESSION_COOKIE_NAME = `ethos.claim.session-${config.ETHOS_ENV}`;
const TWITTER_USER_COOKIE_NAME = `ethos.claim.twitter-user-${config.ETHOS_ENV}`;
const REFERRAL_COOKIE_NAME = `ethos.claim.referral-${config.ETHOS_ENV}`;
const redirectUrl = `${webUrlMap[config.ETHOS_ENV]}/claimed`;

function getFailureRedirectUrl(error: ClaimError = 'unknown', req: Request): string {
  const url = new URL('/claim', webUrlMap[config.ETHOS_ENV]);
  url.searchParams.append('error', error);

  const referralId = getReferralIdFromCookie(req);

  if (referralId) {
    url.searchParams.append('referral', referralId);
  }

  return url.toString();
}

const isLocal = config.ETHOS_ENV === 'local';
const maxAge = duration(7, 'day').toMilliseconds();
/**
 * Domain for the cookies. If the environment is local, the domain is not set.
 * It's localhost, so it will be shared between echo and web anyway. Otherwise,
 * set it to .ethos.network so it's shared between all subdomains.
 */
const domain = isLocal ? undefined : '.ethos.network';

export class Claim extends Route {
  /**
   * Initiate Twitter OAuth2 flow
   */
  async twitterLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Save referral ID to session if present
    if (typeof req.query.referralId === 'string') {
      res.cookie(REFERRAL_COOKIE_NAME, req.query.referralId, {
        maxAge: duration(1, 'hour').toMilliseconds(),
        httpOnly: false,
        secure: !isLocal,
      });
    } else {
      // Remove referral cookie if referral ID is not present in the query
      res.clearCookie(REFERRAL_COOKIE_NAME, { httpOnly: false, secure: !isLocal });
    }

    passport.authenticate('twitter')(req, res, next);
  }

  /**
   * Callback for Twitter OAuth2 flow
   */
  async twitterCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    passport.authenticate('twitter', {
      failureRedirect: getFailureRedirectUrl(
        // This is the only place where we can pass some unknown string as an
        // error. Casting it to `ClaimError` just to make TS happy. Enforcing
        // this type on getFailureRedirectUrl is makes it safer when we pass
        // custom errors.
        typeof req.query.error === 'string' ? (req.query.error as ClaimError) : undefined,
        req,
      ),
    })(req, res, next);
  }

  async claimXp(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      req.logger.warn('No user found in request');
      res.redirect(getFailureRedirectUrl(claimErrors.noUser, req));

      return;
    }

    // By default, req.user is of type `Express.User`. We cast it to our custom
    // type `ProfileWithMetaData` as passport strategy populates this object
    // after OAuth. No need to verify the exact structure because we are doing
    // validation in the service.
    const user = req.user as ProfileWithMetaData;

    const referrerId = getReferralIdFromCookie(req);

    try {
      await this.initService(ClaimXpService, {
        twitterUser: {
          id: user.id,
          username: user.username,
          name: user.displayName,
          avatar: user.photos?.[0]?.value,
        },
        referrerId,
      }).run(req);
    } catch (err) {
      if (err instanceof ServiceError) {
        if (err.code === REFERRER_NOT_FOUND) {
          req.logger.info('Referrer not found');
          res.redirect(getFailureRedirectUrl(claimErrors.invalidReferrer, req));

          return;
        }

        if (err.code === REFERRAL_LIMIT_REACHED) {
          req.logger.error({ err }, 'Referral limit reached');
          res.redirect(getFailureRedirectUrl(claimErrors.referralLimitReached, req));

          return;
        }
      }

      req.logger.error({ err }, 'Failed to claim XP');
      res.redirect(getFailureRedirectUrl(claimErrors.failedToClaim, req));

      return;
    }

    await this.createSession(res, user.id);

    res.cookie(TWITTER_USER_COOKIE_NAME, user.id, {
      maxAge,
      httpOnly: false, // So we cannot access it from the frontend
      secure: !isLocal,
      domain,
    });

    res.redirect(redirectUrl);
  }

  async stats(req: Request, res: Response): Promise<void> {
    void this.initService(ClaimStatsService).run(req, res);
  }

  async acceptedReferrals(req: Request, res: Response): Promise<void> {
    const { limit, offset } = req.query;

    void this.initService(AcceptedReferralsService, {
      pagination: {
        limit,
        offset,
      },
    }).run(req, res);
  }

  /**
   * Reset claim for current user. This is used only for debugging/testing
   * purposes.
   * It will clean session cookies on any envs but actually delete the claim
   * from DB only on local and dev environment.
   */
  async resetClaim(req: Request, res: Response): Promise<void> {
    if (['local', 'dev'].includes(config.ETHOS_ENV)) {
      const twitterUserId = await this.getSession(req);
      await this.initService(ResetClaim, { twitterUserId }).run(req);
    }

    const sessionId = cookie.parse(req.headers.cookie ?? '')[SESSION_COOKIE_NAME];

    res.clearCookie(SESSION_COOKIE_NAME, { domain, httpOnly: true, secure: !isLocal });
    res.clearCookie(TWITTER_USER_COOKIE_NAME, { domain, secure: !isLocal });
    res.clearCookie(REFERRAL_COOKIE_NAME, { httpOnly: true, secure: !isLocal });

    if (typeof sessionId === 'string') {
      await redis.del(sessionId);
    }

    this.renderSuccess(undefined, req, res);
  }

  async checkSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    const twitterUserId = await this.getSession(req);

    if (!twitterUserId) {
      this.renderError(RouteError.Unauthorized('Unauthorized'), req, res);

      return;
    }

    req.context.twitterUserId = twitterUserId;

    next();
  }

  /**
   * Create a session for the user. This is used so we could protect endpoints
   * about claim by the current user.
   */
  private async createSession(res: Response, twitterUserId: string): Promise<void> {
    const sessionId = crypto.randomUUID();

    await redis.setex(sessionId, maxAge, twitterUserId);

    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      maxAge,
      httpOnly: true,
      secure: !isLocal,
      domain,
    });
  }

  /**
   * Retrieves Twitter user ID from the session. This is used to protect endpoints.
   */
  private async getSession(req: Request): Promise<string | null> {
    const sessionId = cookie.parse(req.headers.cookie ?? '')[SESSION_COOKIE_NAME];

    if (typeof sessionId !== 'string') {
      return null;
    }

    return await redis.get(sessionId);
  }
}

function getReferralIdFromCookie(req: Request): string | undefined {
  return cookie.parse(req.headers.cookie ?? '')[REFERRAL_COOKIE_NAME];
}
