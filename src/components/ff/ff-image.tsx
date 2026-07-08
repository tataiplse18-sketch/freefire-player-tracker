"use client";

import { useState, useCallback } from "react";

interface FFImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const CATEGORY_ICONS: Record<string, string> = {
  clothing: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
  weapon_skin: "M7 2v11h3v9l7-12h-4l4-8z",
  avatar: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  badge: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z",
  title: "M5 4v3h5.5v12h3V7H19V4z",
  head_frame: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  pet: "M4.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 22c4.97 0 9-2.69 9-6v-1c0-3.31-4.03-6-9-6s-9 2.69-9 6v1c0 3.31 4.03 6 9 6z",
  pet_skin: "M4.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 22c4.97 0 9-2.69 9-6v-1c0-3.31-4.03-6-9-6s-9 2.69-9 6v1c0 3.31 4.03 6 9 6z",
  pet_skill: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
  character_skill: "M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z",
  banner: "M21 3H3v18h18V3zm-9 2l4.5 7.5H7.5L12 5zm-6 13v-4h12v4H6z",
  unknown: "M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z",
};

const CATEGORY_COLORS: Record<string, string> = {
  clothing: "#f97316",
  weapon_skin: "#ef4444",
  avatar: "#a855f7",
  badge: "#eab308",
  title: "#f97316",
  head_frame: "#06b6d4",
  pin: "#ec4899",
  pet: "#f59e0b",
  pet_skin: "#f59e0b",
  pet_skill: "#22c55e",
  character_skill: "#eab308",
  banner: "#3b82f6",
  unknown: "#6b7280",
};

const SIZE_MAP = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

export function FFImage({
  src,
  alt,
  className = "",
  category = "unknown",
  label,
  size = "md",
}: FFImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const iconPath = CATEGORY_ICONS[category] || CATEGORY_ICONS.unknown;
  const iconColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.unknown;

  // Show placeholder on failure
  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${SIZE_MAP[size]} ${className}`}
        title={`${alt} (CDN unavailable)`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-1/2 h-1/2"
          fill={iconColor}
          opacity="0.6"
        >
          <path d={iconPath} />
        </svg>
        <span className="text-[8px] text-muted-foreground/40 font-mono mt-0.5 leading-none text-center px-0.5 truncate max-w-full">
          {label || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Loading shimmer while image loads */}
      {!loaded && (
        <div className="absolute inset-0 shimmer rounded-lg" />
      )}
    </div>
  );
}