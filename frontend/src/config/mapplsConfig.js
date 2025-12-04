export const MAPPLS_KEYS = {
  MAP_SDK_KEY: import.meta.env.VITE_MAPPLS_MAP_SDK_KEY,
};

if (!MAPPLS_KEYS.MAP_SDK_KEY) {
  console.warn(
    "[Mappls] MAP_SDK_KEY not configured. Set VITE_MAPPLS_MAP_SDK_KEY in .env"
  );
}
