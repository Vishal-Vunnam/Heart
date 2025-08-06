import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { getImageUrlWithSAS } from "@/services/api/image";

/**
 * Returns a React Native <Image> component with a protected SAS URL as the source.
 * Usage: <ProtectedImage url={...} style={...} showBorder={true} borderColor="#000" borderWidth={2} />
 */
export default function ProtectedImage({
  url,
  style,
  showBorder = true,
  borderColor = "#000",
  borderWidth = 2.5,
  resizeMode = "contain",
  ...props
}: {
  url: string;
  style?: any;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  [key: string]: any;
}) {
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [containedDimensions, setContainedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    setSasUrl(null);
    setError(null);
    setContainedDimensions(null);

    if (!url) return;
    
    getImageUrlWithSAS(url)
      .then((data) => {
        if (!isMounted) return;
        
        let imageUrl: string;
        
        // If the backend returns a string, use it directly
        if (typeof data === 'string') {
          imageUrl = data;
        } else if (data?.url) {
          imageUrl = data.url;
        } else if (data?.sasUrl) {
          imageUrl = data.sasUrl;
        } else {
          imageUrl = url;
        }
        
        setSasUrl(imageUrl);
        
        // If we need a border with contain mode, calculate the contained dimensions
        if (showBorder && resizeMode === "contain") {
          const containerStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
          const containerWidth = containerStyle.width || 200;
          const containerHeight = containerStyle.height || 200;
          
          Image.getSize(
            imageUrl,
            (imageWidth, imageHeight) => {
              if (!isMounted) return;
              
              const imageAspectRatio = imageWidth / imageHeight;
              const containerAspectRatio = containerWidth / containerHeight;
              
              let finalWidth, finalHeight;
              
              if (imageAspectRatio > containerAspectRatio) {
                // Image is wider, fit to width
                finalWidth = containerWidth;
                finalHeight = containerWidth / imageAspectRatio;
              } else {
                // Image is taller, fit to height
                finalHeight = containerHeight;
                finalWidth = containerHeight * imageAspectRatio;
              }
              
              setContainedDimensions({
                width: finalWidth,
                height: finalHeight
              });
            },
            () => {
              // If getSize fails, fallback to container dimensions
              if (isMounted) {
                setContainedDimensions({
                  width: containerWidth,
                  height: containerHeight
                });
              }
            }
          );
        }
      })
      .catch(() => {
        if (isMounted) setError("Failed to fetch image");
      });

    return () => {
      isMounted = false;
    };
  }, [url, showBorder, resizeMode, style]);

  if (error || !sasUrl) return null;

  // If no border needed, return simple image
  if (!showBorder) {
    return (
      <Image 
        source={{ uri: sasUrl }} 
        style={style} 
        resizeMode={resizeMode}
        {...props} 
      />
    );
  }

 // For contain mode with border, use calculated dimensions
  if (resizeMode === "contain" && containedDimensions) {
    return (
      <View
        style={{
          width: containedDimensions.width,
          height: containedDimensions.height,
          borderWidth,
          borderColor,
          overflow: 'hidden', // Prevents any overflow
        }}
      >
        <Image
          source={{ uri: sasUrl }}
          style={{
            width: containedDimensions.width,
            height: containedDimensions.height,
          }}
          resizeMode="cover" // Changed from contain to cover since we pre-calculated the dimensions
          {...props}
        />
      </View>
    );
  }
  // For contain mode while dimensions are loading, show placeholder
  if (resizeMode === "contain" && !containedDimensions) {
    return null; // or a loading indicator
  }

  // For all other resize modes, use simple wrapper
  return (
    <View
      style={{
        borderWidth,
        borderColor,
        alignSelf: 'center',
      }}
    >
      <Image
        source={{ uri: sasUrl }}
        style={style}
        resizeMode={resizeMode}
        {...props}
      />
    </View>
  );
}