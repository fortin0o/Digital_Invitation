import React from "react";

interface NeoStickerProps {
  icon?: string;
  label?: string;
  color?: "yellow" | "pink" | "cyan" | "green" | "purple" | "orange" | "white";
  rotate?: string; // e.g. "-rotate-3", "rotate-6"
  className?: string;
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  yellow: "bg-[#FFE600] text-[#18181B]",
  pink: "bg-[#FF5D8F] text-[#18181B]",
  cyan: "bg-[#38BDF8] text-[#18181B]",
  green: "bg-[#2EE59D] text-[#18181B]",
  purple: "bg-[#A78BFA] text-[#18181B]",
  orange: "bg-[#FF9233] text-[#18181B]",
  white: "bg-[#FFFFFF] text-[#18181B]",
};

export default function NeoSticker({
  icon = "★",
  label,
  color = "yellow",
  rotate = "-rotate-2",
  className = "",
  size = "md",
}: NeoStickerProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181b] select-none transition-transform hover:scale-105 ${colorMap[color]} ${sizeClasses} ${rotate} ${className}`}
    >
      <span>{icon}</span>
      {label && <span>{label}</span>}
    </div>
  );
}
