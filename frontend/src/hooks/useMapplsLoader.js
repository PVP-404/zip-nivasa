import { useEffect, useState } from "react";

export default function useMapplsLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.mappls) {
      setLoaded(true);
      return;
    }

    const check = setInterval(() => {
      if (window.mappls) {
        setLoaded(true);
        clearInterval(check);
      }
    }, 300);

    return () => clearInterval(check);
  }, []);

  return loaded;
}
