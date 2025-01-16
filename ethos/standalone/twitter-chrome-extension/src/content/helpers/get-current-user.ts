/*
This is the DOM search and our form of Authentication
We poke around the DOM looking for the user name, which is pretty prevalent for logged in users.

We also try to get the user name from the window.__INITIAL_STATE__ object, which is set by the Twitter app.
*/

export async function getCurrentTwitterUser(): Promise<string | null> {
  console.debug('[Ethos] Attempting to get current Twitter user...');

  return await new Promise((resolve) => {
    const checkInterval = 500;
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds maximum

    const intervalId = setInterval(() => {
      attempts++;

      // Method 1: Try to find the profile link by data-testid (most reliable)
      const profileByTestId = document.querySelector<HTMLAnchorElement>(
        'a[data-testid="AppTabBar_Profile_Link"]',
      );
      const testIdUsername = extractUsername(profileByTestId?.href);
      console.debug('[Ethos] Method 1 - Profile test ID:', testIdUsername);

      // Method 2: Try to find link with aria-label="Profile"
      const profileByAriaLabel =
        document.querySelector<HTMLAnchorElement>('a[aria-label="Profile"]');
      const ariaUsername = extractUsername(profileByAriaLabel?.href);
      console.debug('[Ethos] Method 2 - Profile by aria-label:', ariaUsername);

      // Method 3: Try to find any nav link that looks like a profile
      const allNavLinks = document.querySelectorAll('nav a[href^="/"]');
      const possibleProfileLink = Array.from(allNavLinks).find(
        (link): link is HTMLAnchorElement => {
          const href = link.getAttribute('href');
          const ariaLabel = link.getAttribute('aria-label');

          return (
            typeof href === 'string' &&
            href !== '/home' &&
            href !== '/explore' &&
            !href.includes('/i/') &&
            !href.includes('/lists') &&
            !href.includes('/messages') &&
            (!ariaLabel || ariaLabel === 'Profile')
          );
        },
      );
      const navUsername = extractUsername(possibleProfileLink?.href);
      console.debug('[Ethos] Method 3 - Possible profile link:', navUsername);

      // Try each method in order
      const userHandle = testIdUsername ?? ariaUsername ?? navUsername;

      if (userHandle) {
        console.debug('[Ethos] Found current user:', userHandle);
        clearInterval(intervalId);
        resolve(userHandle);

        return;
      }

      // If we've tried too many times, give up
      if (attempts >= maxAttempts) {
        console.debug('[Ethos] Failed to find current user after', maxAttempts, 'attempts');
        console.debug('[Ethos] DOM state:', document.body.innerHTML);
        clearInterval(intervalId);
        resolve(null);
      }
    }, checkInterval);
  });
}

export function extractUsername(href?: string): string | undefined {
  if (!href) return undefined;

  try {
    const { pathname } = new URL(href, 'https://x.com');
    const segments = pathname.split('/');

    if (segments.length > 2) return undefined;

    return segments[1];
  } catch {
    return undefined;
  }
}
