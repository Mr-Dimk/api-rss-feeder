import { v4 as uuidv4 } from 'uuid';

/**
 * User Model (Stateless, token-based)
 * Provides functions to generate and validate API tokens.
 */

// Generate a new API token
export function generateToken() {
  return uuidv4();
}

// Validate token format (UUID v4)
export function isValidToken(token) {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(token);
}

// Refresh token (generate a new one)
export function refreshToken() {
  return uuidv4();
}
