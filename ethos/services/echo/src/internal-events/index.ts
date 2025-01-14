import { type RedlockAbortSignal } from 'redlock2';
import { CronJobManager } from '../common/cron.js';
import { createDailyEthosJobs, createHourlyEthosJobs } from '../contract-events/message-queue.js';

const CRON_EXPRESSION_EVERY_HOUR = '0 * * * *';
const CRON_EXPRESSION_EVERY_DAY = '0 0 * * *';
const INTERNAL_ETHOS_EVENTS_LOCK = ['internal-ethos-events-lock'];

const hourlyJob = new CronJobManager(
  CRON_EXPRESSION_EVERY_HOUR,
  INTERNAL_ETHOS_EVENTS_LOCK,
  'internal-events',
  async (signal: RedlockAbortSignal) => {
    await hourlyJob.executeJob(signal, async () => {
      await createHourlyEthosJobs();
    });
  },
);

const dailyJob = new CronJobManager(
  CRON_EXPRESSION_EVERY_DAY,
  INTERNAL_ETHOS_EVENTS_LOCK,
  'internal-events',
  async (signal: RedlockAbortSignal) => {
    await dailyJob.executeJob(signal, async () => {
      await createDailyEthosJobs();
    });
  },
);

export const startInternalEventsHourlyJob = hourlyJob.start.bind(hourlyJob);
export const stopInternalEventsHourlyJob = hourlyJob.stop.bind(hourlyJob);

export const startInternalEventsDailyJob = dailyJob.start.bind(dailyJob);
export const stopInternalEventsDailyJob = dailyJob.stop.bind(dailyJob);
