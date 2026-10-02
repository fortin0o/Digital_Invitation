import React from "react";

interface BotanicalCornerProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  size?: number;
  opacity?: number;
}

export default function BotanicalCorner({
  position = "top-left",
  className = "",
  size = 110,
  opacity = 0.55,
}: BotanicalCornerProps) {
  let positionStyles = "";
  let transform = "";

  switch (position) {
    case "top-left":
      positionStyles = "top-0 left-0";
      transform = "scale(1, 1)";
      break;
    case "top-right":
      positionStyles = "top-0 right-0";
      transform = "scale(-1, 1)";
      break;
    case "bottom-left":
      positionStyles = "bottom-0 left-0";
      transform = "scale(1, -1)";
      break;
    case "bottom-right":
      positionStyles = "bottom-0 right-0";
      transform = "scale(-1, -1)";
      break;
  }

  return (
    <div
      className={`absolute pointer-events-none select-none z-0 ${positionStyles} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform }}
      >
        <defs>
          <linearGradient id="ukir-gold-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EAD7A8" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#8A6B53" />
          </linearGradient>
        </defs>

        {/* Javanese Classical Ukir Sulur Jepara */}
        {/* Main curved spine */}
        <path
          d="M 4 4 C 20 4, 40 10, 58 24 C 74 38, 86 58, 92 84 C 95 98, 96 112, 96 118"
          stroke="url(#ukir-gold-grad)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Secondary inner contour spine */}
        <path
          d="M 12 12 C 24 12, 40 18, 52 28 C 66 40, 74 56, 78 78 C 80 92, 82 108, 82 116"
          stroke="url(#ukir-gold-grad)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.7"
        />

        {/* Outer Corner Frame Border Lines */}
        <path
          d="M 4 60 L 4 4 L 60 4"
          stroke="url(#ukir-gold-grad)"
          strokeWidth="0.9"
        />
        <circle cx="4" cy="4" r="2.5" fill="#C5A059" />

        {/* Central Lotus / Lung-Lungan Spiral */}
        <path
          d="M 32 32 C 40 20, 54 22, 54 30 C 54 38, 44 42, 38 38 C 34 36, 32 30, 38 26"
          stroke="url(#ukir-gold-grad)"
          strokeWidth="1.1"
          fill="#FAF6F0"
          fillOpacity="0.4"
        />

        {/* Sulur daun Jawa / Ukir Daun Patran */}
        <path
          d="M 18 18 C 24 10, 36 12, 38 20 C 32 24, 22 24, 18 18 Z"
          fill="#C5A059"
          fillOpacity="0.3"
          stroke="#C5A059"
          strokeWidth="0.8"
        />
        <path
          d="M 52 46 C 62 38, 72 42, 70 52 C 62 58, 54 54, 52 46 Z"
          fill="#C5A059"
          fillOpacity="0.25"
          stroke="#C5A059"
          strokeWidth="0.8"
        />
        <path
          d="M 76 72 C 86 64, 96 70, 92 80 C 84 86, 78 80, 76 72 Z"
          fill="#C5A059"
          fillOpacity="0.25"
          stroke="#C5A059"
          strokeWidth="0.8"
        />

        {/* Floral jewel dots */}
        <circle cx="28" cy="14" r="1.5" fill="#C5A059" />
        <circle cx="58" cy="38" r="1.5" fill="#C5A059" />
        <circle cx="82" cy="68" r="1.5" fill="#C5A059" />
      </svg>
    </div>
  );
}
