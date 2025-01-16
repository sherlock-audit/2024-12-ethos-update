import { type ExtensionIdentity, EXTENSION_IDENTITY_KEY } from '../../types/security';

/**
 * Generates or retrieves the extension's unique identity
 */
export async function getExtensionIdentity(): Promise<ExtensionIdentity> {
  return await new Promise((resolve) => {
    chrome.storage.local.get([EXTENSION_IDENTITY_KEY], async (result) => {
      if (result[EXTENSION_IDENTITY_KEY]) {
        resolve(result[EXTENSION_IDENTITY_KEY] as ExtensionIdentity);

        return;
      }

      // Generate new identity if none exists
      const manifest = chrome.runtime.getManifest();
      const identity: ExtensionIdentity = {
        installationId: crypto.randomUUID(),
        installDate: new Date().toISOString(),
        version: manifest.version,
      };

      // Store the identity
      await chrome.storage.local.set({ [EXTENSION_IDENTITY_KEY]: identity });
      resolve(identity);
    });
  });
}

/**
 * Creates a signature for the daily check-in
 */
export async function signCheckIn(twitterHandle: string): Promise<{
  timestamp: number;
  signature: string;
  installationId: string;
}> {
  const identity = await getExtensionIdentity();
  const timestamp = Date.now();

  // Create a string to sign
  const dataToSign = `${twitterHandle}:${timestamp}:${identity.installationId}`;

  // Convert string to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(dataToSign);
  const keyMaterial = encoder.encode(identity.installationId);

  // Generate signature using SubtleCrypto
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);

  // Convert to base64
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return {
    timestamp,
    signature: signatureBase64,
    installationId: identity.installationId,
  };
}
