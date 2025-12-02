// backend/utils/mapplsToken.js
import axios from "axios";
import qs from "qs";

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Get Mappls OAuth token (auto-cached until expiry)
 */
export async function getMapplsToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiry > now) {
    return cachedToken;
  }

  const body = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.MAPPLS_CLIENT_ID,
    client_secret: process.env.MAPPLS_CLIENT_SECRET,
  });

  const res = await axios.post(
    "https://outpost.mappls.com/api/security/oauth/token",
    body,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const { access_token, expires_in } = res.data;

  cachedToken = access_token;
  tokenExpiry = now + (expires_in - 60) * 1000; // refresh 1 min before expiry

  return cachedToken;
}
