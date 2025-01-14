import { type DailyCheckInMessage } from '../../types/message';
import { ethios } from '../config/axios';
import { ETHOS_API_URL } from '../config/constants';

export async function handleDailyCheckIn({
  twitterHandle,
  timestamp,
  installationId,
  signature,
}: DailyCheckInMessage): Promise<void> {
  try {
    await ethios.post(`${ETHOS_API_URL}/api/v1/xp/extension-daily-checkin`, {
      twitterHandle,
      timestamp,
      installationId,
      signature,
    });
  } catch (error) {
    console.error('Error processing daily check-in:', error);
    throw error;
  }
}
