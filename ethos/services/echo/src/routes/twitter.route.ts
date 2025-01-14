import { type Request, type Response } from 'express';
import { TwitterUser } from '../services/twitter/user.service.js';
import { Route } from './route.base.js';

export class Twitter extends Route {
  async user(req: Request, res: Response): Promise<void> {
    void this.initService(TwitterUser, req.query).run(req, res);
  }
}
