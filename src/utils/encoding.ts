export interface SecretSantaPayload {
  t: string; // title
  d: string; // description
  g: string; // giver
  r: string; // receiver
}

/**
 * Encodes a Secret Santa payload into a URL-safe string
 * Process: JSON.stringify → reverse → base64 → URL encode
 */
export function encodePayload(payload: SecretSantaPayload): string {
  // Step 1: JSON.stringify
  const json = JSON.stringify(payload);

  // Step 2: Reverse string
  const reversed = json.split('').reverse().join('');

  // Step 3: Base64 encode
  const base64 = btoa(reversed);

  // Step 4: URL encode
  return encodeURIComponent(base64);
}

/**
 * Decodes a URL-safe string back into a Secret Santa payload
 * Process: URL decode → base64 decode → reverse → JSON.parse
 */
export function decodePayload(encoded: string): SecretSantaPayload | null {
  try {
    // Step 1: URL decode
    const urlDecoded = decodeURIComponent(encoded);

    // Step 2: Base64 decode
    const base64Decoded = atob(urlDecoded);

    // Step 3: Reverse string
    const reversed = base64Decoded.split('').reverse().join('');

    // Step 4: JSON.parse
    const payload = JSON.parse(reversed) as SecretSantaPayload;

    // Validate payload shape
    if (
      typeof payload.t === 'string' &&
      typeof payload.d === 'string' &&
      typeof payload.g === 'string' &&
      typeof payload.r === 'string'
    ) {
      return payload;
    }

    return null;
  } catch (error) {
    return null;
  }
}
