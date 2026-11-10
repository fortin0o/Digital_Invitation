import React from "react";

interface NeoDividerProps {
  className?: string;
}

export default function NeoDivider({ className = "" }: NeoDividerProps) {
  return (
    <div className={`my-4 flex items-center justify-center gap-2 select-none ${className}`}>
      <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] border-2 border-[#18181B]" />
      <span className="w-12 h-1 bg-[#18181B] rounded-full" />
      <span className="w-3.5 h-3.5 rounded-md bg-[#FF5D8F] border-2 border-[#18181B] rotate-45" />
      <span className="w-12 h-1 bg-[#18181B] rounded-full" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] border-2 border-[#18181B]" />
    </div>
  );
}
