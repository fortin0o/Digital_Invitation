import React from "react";

interface GununganOrnamentProps {
  className?: string;
  size?: number;
  variant?: "gold" | "sogan" | "subtle";
  flipped?: boolean;
}

export default function GununganOrnament({
  className = "",
  size = 120,
  variant = "gold",
  flipped = false,
}: GununganOrnamentProps) {
  const getGradientId = `gunungan-grad-${variant}-${flipped ? "f" : "n"}`;

  return (
    <div
      className={`inline-block select-none pointer-events-none ${className}`}
      style={{
        width: size,
        height: size * 1.5,
        transform: flipped ? "scaleX(-1)" : undefined,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id={getGradientId} x1="50" y1="0" x2="50" y2="150" gradientUnits="userSpaceOnUse">
            {variant === "gold" ? (
              <>
                <stop offset="0%" stopColor="#EAD7A8" />
                <stop offset="40%" stopColor="#C5A059" />
                <stop offset="70%" stopColor="#A67C2E" />
                <stop offset="100%" stopColor="#7E5618" />
              </>
            ) : variant === "sogan" ? (
              <>
                <stop offset="0%" stopColor="#A37E61" />
                <stop offset="50%" stopColor="#5C3A21" />
                <stop offset="100%" stopColor="#3D261C" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#C5A059" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#5C3A21" stopOpacity="0.15" />
              </>
            )}
          </linearGradient>

          <filter id={`glow-${getGradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Gunungan Silhouette Outline */}
        <path
          d="M50 4 
             C53 18 64 25 66 38 
             C68 48 60 52 72 65 
             C82 76 88 88 84 104 
             C80 120 70 134 50 142 
             C30 134 20 120 16 104 
             C12 88 18 76 28 65 
             C40 52 32 48 34 38 
             C36 25 47 18 50 4 Z"
          stroke={`url(#${getGradientId})`}
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />

        {/* Inner Decorative Contour */}
        <path
          d="M50 12 
             C52 23 60 29 62 40 
             C64 49 57 53 67 64 
             C75 74 80 84 76 98 
             C72 112 64 125 50 132 
             C36 125 28 112 24 98 
             C20 84 25 74 33 64 
             C43 53 36 49 38 40 
             C40 29 48 23 50 12 Z"
          stroke={`url(#${getGradientId})`}
          strokeWidth="0.8"
          strokeDasharray="2 2"
          fill="none"
          opacity="0.6"
        />

        {/* Central Spire (Mustaka Gunungan) */}
        <path
          d="M50 0 L51.5 12 L48.5 12 Z"
          fill={`url(#${getGradientId})`}
        />
        <circle cx="50" cy="18" r="2.2" fill={`url(#${getGradientId})`} />

        {/* Tree of Life (Kalpataru / Pohon Hayat) Central Trunk */}
        <path
          d="M50 28 L50 140"
          stroke={`url(#${getGradientId})`}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Branching Filigree (Sulur Daun dan Dahan Kayon) */}
        {/* Tier 1 Branches */}
        <path
          d="M50 45 Q60 40 64 48 Q60 52 50 50"
          stroke={`url(#${getGradientId})`}
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M50 45 Q40 40 36 48 Q40 52 50 50"
          stroke={`url(#${getGradientId})`}
          strokeWidth="0.8"
          fill="none"
        />

        {/* Tier 2 Branches with Floral Spiral */}
        <path
          d="M50 62 Q68 55 70 68 Q62 74 50 70"
          stroke={`url(#${getGradientId})`}
          strokeWidth="0.9"
          fill="none"
        />
        <path
          d="M50 62 Q32 55 30 68 Q38 74 50 70"
          stroke={`url(#${getGradientId})`}
          strokeWidth="0.9"
          fill="none"
        />

        {/* Tier 3 Branches */}
        <path
          d="M50 82 Q76 75 78 92 Q68 98 50 90"
          stroke={`url(#${getGradientId})`}
          strokeWidth="0.9"
          fill="none"
        />
        <path
          d="M50 82 Q24 75 22 92 Q32 98 50 90"
          stroke={`url(#${getGradientId})`}
          strokeWidth="0.9"
          fill="none"
        />

        {/* Gate of Life / Gapura Paduraksa at bottom */}
        <path
          d="M40 140 L40 108 Q50 102 60 108 L60 140"
          stroke={`url(#${getGradientId})`}
          strokeWidth="1"
          fill="none"
        />
        <circle cx="50" cy="115" r="3" stroke={`url(#${getGradientId})`} strokeWidth="0.8" fill="none" />
        <path d="M46 122 L54 122" stroke={`url(#${getGradientId})`} strokeWidth="0.8" />
        <path d="M44 128 L56 128" stroke={`url(#${getGradientId})`} strokeWidth="0.8" />

        {/* Golden Base / Padmasana Pedestal */}
        <path
          d="M32 145 C40 142 60 142 68 145 L72 149 C60 147 40 147 28 149 Z"
          fill={`url(#${getGradientId})`}
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
