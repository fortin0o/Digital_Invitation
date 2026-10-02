import React from "react";

interface BotanicalDividerProps {
  className?: string;
  width?: number;
  variant?: "gold" | "sogan";
}

export default function BotanicalDivider({
  className = "",
  width = 160,
  variant = "gold",
}: BotanicalDividerProps) {
  const strokeColor = variant === "gold" ? "#C5A059" : "#5C3A21";

  return (
    <div
      className={`flex items-center justify-center my-5 select-none pointer-events-none opacity-80 ${className}`}
      aria-hidden="true"
    >
      <svg
        width={width}
        height="24"
        viewBox="0 0 160 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="div-gold-grad" x1="0" y1="12" x2="160" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0" />
            <stop offset="25%" stopColor="#C5A059" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#EAD7A8" />
            <stop offset="75%" stopColor="#C5A059" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Left flourish line */}
        <line
          x1="10"
          y1="12"
          x2="60"
          y2="12"
          stroke="url(#div-gold-grad)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <circle cx="62" cy="12" r="1.5" fill={strokeColor} />

        {/* Center Javanese Ukiran Motif (Kawung / Padma Flower) */}
        <g transform="translate(80, 12)">
          {/* Diamond core */}
          <rect
            x="-4"
            y="-4"
            width="8"
            height="8"
            transform="rotate(45)"
            fill="#EAD7A8"
            stroke={strokeColor}
            strokeWidth="0.8"
          />
          {/* Left / Right Petals */}
          <circle cx="-9" cy="0" r="2.5" stroke={strokeColor} strokeWidth="0.8" fill="none" />
          <circle cx="9" cy="0" r="2.5" stroke={strokeColor} strokeWidth="0.8" fill="none" />
          {/* Top / Bottom Petals */}
          <circle cx="0" cy="-6" r="1.8" fill={strokeColor} />
          <circle cx="0" cy="6" r="1.8" fill={strokeColor} />
        </g>

        {/* Right flourish line */}
        <circle cx="98" cy="12" r="1.5" fill={strokeColor} />
        <line
          x1="100"
          y1="12"
          x2="150"
          y2="12"
          stroke="url(#div-gold-grad)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
