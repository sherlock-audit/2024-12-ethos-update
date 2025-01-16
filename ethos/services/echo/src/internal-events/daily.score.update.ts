import { rootLogger } from '../common/logger.js';

const logger = rootLogger.child({ module: 'daily-score-update' });

export type InternalEthosJob = {
  job: string;
};

export async function processScoreUpdateJob(payload: InternalEthosJob): Promise<void> {
  logger.info(
    { data: payload, message: 'Mock job logging; not implemented yet' },
    'Processing score update job',
  );
}
