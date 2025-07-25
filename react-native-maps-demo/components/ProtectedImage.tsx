
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { getImageUrlWithSAS } from "@/services/api/image";

/**
 * Returns a React Native <Image> component with a protected SAS URL as the source.
 * Usage: <ProtectedImage url={...} style={...} />
 */
export default function ProtectedImage({
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
          // If the backend returns a string, use it directly
          if (typeof data === 'string') {
            setSasUrl(data);
          } else if (data?.url) {
            setSasUrl(data.url);
          } else if (data?.sasUrl) {
            setSasUrl(data.sasUrl);
          } else {
            setSasUrl(url);
          }
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