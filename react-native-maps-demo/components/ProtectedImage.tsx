
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { getImageUrlWithSAS } from "@/api/image";

/**
 * Returns a React Native <Image> component with a protected SAS URL as the source.
 * Usage: <ProtectedImage url={...} style={...} />
 */
export function ProtectedImage({
  url,
  style,
  ...props
}: {
  url: string;
  style?: any;
  [key: string]: any;
}) {
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setSasUrl(null);
    setError(null);

    if (!url) return;

    getImageUrlWithSAS(url)
      .then((data) => {
        if (isMounted) {
          // Prefer data.url, fallback to data.sasUrl, fallback to original url
          setSasUrl(data?.url || data?.sasUrl || url);
        }
      })
      .catch(() => {
        if (isMounted) setError("Failed to fetch image");
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (error || !sasUrl) return null;
  return <Image source={{ uri: sasUrl }} style={style} {...props} />;
}