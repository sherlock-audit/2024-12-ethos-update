import { type Request, type Response } from 'express';
import { ExtensionCheckInService } from '../services/xp/extension-checkin.service.js';
import { XpHistoryService } from '../services/xp/xp-history.service.js';
import { Route } from './route.base.js';

export class XpRoute extends Route {
  async xpHistory(req: Request, res: Response): Promise<void> {
    const { limit, offset, ...query } = req.query;
    void this.initService(XpHistoryService, {
      ...req.params,
      ...query,
      pagination: {
        limit,
        offset,
      },
    }).run(req, res);
  }

  async dailyCheckIn(req: Request, res: Response): Promise<void> {
    void this.initService(ExtensionCheckInService, req.body).run(req, res);
  }
}
