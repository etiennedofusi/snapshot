"use client";

import { cn } from "@/lib/utils";

type MascotProps = {
  size?: "sm" | "md" | "lg";
  mood?: "happy" | "wink" | "excited";
  className?: string;
  animate?: boolean;
};

export function Mascot({ size = "md", mood = "happy", className, animate = true }: MascotProps) {
  const dims = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" };
  const bodyDims = { sm: "w-14 h-14", md: "w-20 h-20", lg: "w-28 h-28" };
  const eyeSize = { sm: "w-2.5 h-3", md: "w-3.5 h-4", lg: "w-5 h-5.5" };
  const pupilSize = { sm: "w-1.5 h-1.5", md: "w-2 h-2", lg: "w-3 h-3" };
  const antennaH = { sm: "h-3", md: "h-4", lg: "h-5" };
  const mouthW = { sm: "w-4", md: "w-6", lg: "w-8" };

  return (
    <div className={cn("relative inline-flex items-end justify-center", dims[size], animate && "animate-float", className)}>
      {/* Antenna */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <div className={cn(
          "rounded-full bg-amber-400 shadow-sm",
          size === "sm" ? "w-2 h-2" : size === "md" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"
        )} />
        <div className={cn(
          "w-0.5 bg-gray-300 rounded-full",
          antennaH[size]
        )} />
      </div>

      {/* Body */}
      <div className={cn(
        "relative rounded-[40%] bg-gradient-to-b from-green-400 to-green-500 shadow-lg flex items-center justify-center",
        bodyDims[size]
      )}>
        {/* Shine */}
        <div className="absolute top-1.5 left-2 w-1/4 h-1/4 bg-white/20 rounded-full blur-sm" />

        {/* Face */}
        <div className="flex flex-col items-center gap-1">
          {/* Eyes */}
          <div className={cn("flex gap-2", size === "lg" && "gap-3")}>
            {/* Left eye */}
            <div className={cn("bg-white rounded-full flex items-end justify-center relative overflow-hidden", eyeSize[size])}>
              <div className={cn(
                "bg-gray-800 rounded-full mb-0.5",
                pupilSize[size],
                mood === "wink" ? "hidden" : ""
              )} />
              {mood === "wink" && (
                <div className={cn("border-b-2 border-gray-800 rounded-full mb-1", mouthW[size])} style={{ width: "60%", height: "1px" }} />
              )}
            </div>
            {/* Right eye */}
            <div className={cn("bg-white rounded-full flex items-end justify-center overflow-hidden", eyeSize[size])}>
              <div className={cn("bg-gray-800 rounded-full mb-0.5", pupilSize[size])} />
            </div>
          </div>

          {/* Mouth */}
          <div className="flex justify-center">
            {mood === "excited" ? (
              <div className={cn(
                "bg-gray-800 rounded-b-full",
                size === "sm" ? "w-3 h-1.5" : size === "md" ? "w-4 h-2" : "w-6 h-3"
              )} />
            ) : (
              <svg
                viewBox="0 0 20 8"
                className={cn(mouthW[size])}
                fill="none"
              >
                <path
                  d="M3 2C5 6 15 6 17 2"
                  stroke="#1f2937"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Arms — little rounded stubs */}
        <div className={cn(
          "absolute top-1/2 -left-1 -translate-y-1/2 bg-green-500 rounded-full shadow-sm",
          size === "sm" ? "w-2 h-3" : size === "md" ? "w-2.5 h-4" : "w-3 h-5"
        )} />
        <div className={cn(
          "absolute top-1/2 -right-1 -translate-y-1/2 bg-green-500 rounded-full shadow-sm",
          size === "sm" ? "w-2 h-3" : size === "md" ? "w-2.5 h-4" : "w-3 h-5"
        )} />
      </div>
    </div>
  );
}

/* Hero version with channel icons orbiting */
export function MascotHero({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-40 h-40 flex items-center justify-center", className)}>
      <Mascot size="lg" mood="excited" />

      {/* Orbiting channel badges */}
      <div className="absolute -top-1 -right-1 h-10 w-10 rounded-xl bg-green-100 border-2 border-white shadow-md flex items-center justify-center animate-float" style={{ animationDelay: "0s" }}>
        <span className="text-lg">💬</span>
      </div>
      <div className="absolute top-1/2 -left-4 -translate-y-1/2 h-10 w-10 rounded-xl bg-purple-100 border-2 border-white shadow-md flex items-center justify-center animate-float" style={{ animationDelay: "0.5s" }}>
        <span className="text-lg">📸</span>
      </div>
      <div className="absolute -bottom-2 right-2 h-10 w-10 rounded-xl bg-blue-100 border-2 border-white shadow-md flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
        <span className="text-lg">🌐</span>
      </div>
    </div>
  );
}
