import { type Request, type Response } from 'express';
import { TestnetActivitiesService } from '../services/migrate/testnet-activities.service.js';
import { Route } from './route.base.js';

export class Migration extends Route {
  async getActivities(req: Request, res: Response): Promise<void> {
    const { limit, offset, ...query } = req.query;

    void this.initService(TestnetActivitiesService, {
      ...query,
      pagination: {
        limit,
        offset,
      },
    }).run(req, res);
  }
}
