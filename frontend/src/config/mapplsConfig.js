// frontend/src/config/mapplsConfig.js
export const MAPPLS_KEYS = {
  MAP_SDK_KEY: import.meta.env.VITE_MAPPLS_MAP_SDK_KEY,
};

if (!MAPPLS_KEYS.MAP_SDK_KEY) {
  // Helpful warning in dev console
  // You will see this if .env is missing or wrong
  console.warn(
    "[Mappls] MAP_SDK_KEY not configured. Set VITE_MAPPLS_MAP_SDK_KEY in .env"
  );
}
