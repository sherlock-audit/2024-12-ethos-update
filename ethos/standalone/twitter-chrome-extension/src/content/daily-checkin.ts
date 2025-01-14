import { getCurrentTwitterUser } from './helpers/get-current-user';

let checkInAttempted = false;

export function resetCheckInAttempted() {
  checkInAttempted = false;
}

async function getLastCheckInTime(): Promise<number> {
  const result = await chrome.storage.local.get('lastCheckInTime');

  return result.lastCheckInTime || 0;
}

async function setLastCheckInTime(time: number) {
  await chrome.storage.local.set({ lastCheckInTime: time });
}

function isWithin24Hours(timestamp: number): boolean {
  const now = Date.now();
  const hoursSinceLastCheckIn = (now - timestamp) / (1000 * 60 * 60);

  return hoursSinceLastCheckIn < 24;
}

export async function attemptDailyCheckIn() {
  // Only try once per page load
  if (checkInAttempted) {
    return;
  }

  checkInAttempted = true;

  try {
    // Check if we've already checked in within the last 24 hours
    const lastCheckInTime = await getLastCheckInTime();

    if (isWithin24Hours(lastCheckInTime)) {
      console.debug('[Ethos] Already checked in within the last 24 hours');

      return;
    }

    const handle = await getCurrentTwitterUser();

    if (!handle) {
      console.debug('[Ethos] Could not find Twitter handle for check-in');

      return;
    }

    // Send check-in message to background script
    chrome.runtime.sendMessage(
      {
        type: 'DAILY_CHECK_IN',
        handle,
      },
      async (response) => {
        if (response?.success) {
          console.debug('[Ethos] Daily check-in successful');
          await setLastCheckInTime(Date.now());
        } else if (response?.error === 'Already checked in today') {
          console.debug('[Ethos] Already checked in today');
          await setLastCheckInTime(Date.now());
        } else {
          console.debug('[Ethos] Daily check-in failed:', response?.error);
        }
      },
    );
  } catch (error) {
    console.error('[Ethos] Error during daily check-in:', error);
  }
}
