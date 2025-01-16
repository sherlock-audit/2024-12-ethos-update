/// <reference types="vite/client" />

import { ETHOS_API_URL } from '../config/constants';
import { signCheckIn } from './security-handler';

const LAST_CHECKIN_KEY = 'lastDailyCheckIn';
const CHECKIN_LOCK_KEY = 'checkInLock';

// Helper to check if we've already checked in today
async function hasCheckedInToday(): Promise<boolean> {
  const result = await chrome.storage.local.get(LAST_CHECKIN_KEY);
  const lastCheckIn = result[LAST_CHECKIN_KEY];

  if (!lastCheckIn || typeof lastCheckIn !== 'string') {
    return false;
  }

  const lastDate = new Date(lastCheckIn);
  const today = new Date();

  return (
    lastDate.getUTCFullYear() === today.getUTCFullYear() &&
    lastDate.getUTCMonth() === today.getUTCMonth() &&
    lastDate.getUTCDate() === today.getUTCDate()
  );
}

// Helper to acquire a lock to prevent concurrent check-ins
async function acquireCheckInLock(): Promise<boolean> {
  const now = Date.now();
  const result = await chrome.storage.local.get(CHECKIN_LOCK_KEY);
  const currentLock = result[CHECKIN_LOCK_KEY];

  // If there's a lock that's less than 10 seconds old, fail
  if (currentLock && typeof currentLock === 'number' && now - currentLock < 10000) {
    return false;
  }

  // Set the lock with current timestamp
  await chrome.storage.local.set({ [CHECKIN_LOCK_KEY]: now });

  return true;
}

// Helper to release the lock
async function releaseCheckInLock(): Promise<void> {
  await chrome.storage.local.remove(CHECKIN_LOCK_KEY);
}

export async function handleDailyCheckIn(
  handle: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Try to acquire lock first
    if (!(await acquireCheckInLock())) {
      return { success: false, error: 'Check-in already in progress' };
    }

    try {
      if (await hasCheckedInToday()) {
        return { success: false, error: 'Already checked in today' };
      }

      // Use signCheckIn instead of manual signature generation
      const { timestamp } = await signCheckIn(handle);

      // Make API call
      const response = await fetch(`${ETHOS_API_URL}/api/v1/xp/extension-daily-checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twitterHandle: handle,
          timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      // Store successful check-in time
      await chrome.storage.local.set({
        [LAST_CHECKIN_KEY]: new Date().toISOString(),
      });

      return { success: true };
    } finally {
      // Always release the lock
      await releaseCheckInLock();
    }
  } catch (error) {
    console.error('[Ethos] Daily check-in error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
