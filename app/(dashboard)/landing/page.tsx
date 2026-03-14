"use client";

import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ViewMode = "desktop" | "tablet" | "mobile";

const VIEWS: { mode: ViewMode; icon: typeof Monitor; label: string; width: string }[] = [
  { mode: "desktop", icon: Monitor, label: "Desktop", width: "w-full" },
  { mode: "tablet", icon: Tablet, label: "Tablette", width: "w-[768px]" },
  { mode: "mobile", icon: Smartphone, label: "Mobile", width: "w-[375px]" },
];

export default function LandingPreviewPage() {
  const [view, setView] = useState<ViewMode>("mobile");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Landing Page</h1>
            <p className="text-sm text-muted-foreground">
              Page de conversion pour vos futurs clients
            </p>
          </div>
          <Button
            variant="outline"
            className="h-10 gap-2"
            onClick={() => window.open("/", "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir
          </Button>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {VIEWS.map((v) => (
            <button
              key={v.mode}
              onClick={() => setView(v.mode)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                view === v.mode
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-auto bg-gray-100 px-4 pb-4">
        <div className="flex justify-center py-4">
          <div
            className={cn(
              "bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300",
              view === "desktop" && "w-full max-w-5xl h-[600px]",
              view === "tablet" && "w-[768px] max-w-full h-[600px]",
              view === "mobile" && "w-[375px] max-w-full h-[700px]"
            )}
          >
            <iframe
              src="/"
              className="w-full h-full border-0"
              title="Landing Page Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
