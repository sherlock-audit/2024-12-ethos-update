import { type Request, type Response, type NextFunction } from 'express';
import { verifyPrivyAuthToken } from '../common/net/privy.client.js';
import { user } from '../data/user/lookup/index.js';
import { Route } from '../routes/route.base.js';
import { RouteError } from '../routes/route.error.js';

type PrivyUser = NonNullable<Request['context']['privyUser']>;

export class AuthMiddlewares extends Route {
  /**
   * Verify the privy session by checking the privy token. This middleware
   * doesn't check if the corresponding record exists in the database. So it's
   * used only for creating a new record.
   */
  async checkPrivySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const privyUser = await this.checkSession(req, {
        requirePrivyLogin: false,
        requireProfile: false,
      });

      req.context = {
        ...req.context,
        privyUser,
      };

      next();
    } catch (err) {
      this.renderError(err, req, res);
    }
  }

  /**
   * Verify the privy session by checking the privy token. This middleware
   * checks if the corresponding record exists in the database. It should be
   * applied to endpoints where the user can modify data in the database or to
   * access private information.
   */
  async requirePrivySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const privyUser = await this.checkSession(req, {
        requirePrivyLogin: true,
        requireProfile: false,
      });

      req.context = {
        ...req.context,
        privyUser,
      };

      next();
    } catch (err) {
      this.renderError(err, req, res);
    }
  }

  /**
   * Verify the privy session by checking the privy token. Also require the user
   * to have Ethos profile. This middleware checks if the corresponding record
   * exists in the database.
   * It should be applied to endpoints where the user can modify data in the
   * database or to access private information.
   */
  async requirePrivySessionAndProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const privyUser = await this.checkSession(req, {
        requirePrivyLogin: true,
        requireProfile: true,
      });

      req.context = {
        ...req.context,
        privyUser,
      };

      next();
    } catch (err) {
      this.renderError(err, req, res);
    }
  }

  private async checkSession(
    req: Request,
    { requirePrivyLogin, requireProfile }: { requirePrivyLogin: boolean; requireProfile: boolean },
  ): Promise<PrivyUser> {
    const privyToken = req.headers.authorization;

    if (!privyToken || typeof privyToken !== 'string') {
      throw RouteError.Unauthorized('Missing privy token');
    }

    const privyTokenClaims = await verifyPrivyAuthToken(privyToken);

    if (!privyTokenClaims) {
      req.logger.warn({ data: { privyTokenClaims } }, 'Invalid privy token');

      throw RouteError.Unauthorized('Invalid privy token');
    }

    const result: PrivyUser = {
      id: privyTokenClaims.userId,
    };

    if (requirePrivyLogin) {
      const privyLogin = await user.getPrivyLoginById(privyTokenClaims.userId);

      if (!privyLogin) {
        req.logger.warn({ data: { privyTokenClaims } }, 'Privy login not found');

        throw RouteError.Unauthorized('Privy login not found');
      }

      const profile = await user.getProfile({ address: privyLogin.connectedWallet });

      if (!profile && requireProfile) {
        req.logger.warn({ data: { privyTokenClaims } }, 'Profile not found');

        throw RouteError.Forbidden('Profile not found');
      }

      result.data = privyLogin;

      if (profile) {
        result.profile = profile;
      }
    }

    return result;
  }
}
