"use client";
import React from "react";
import { SkeletonOverviewCards } from "@/components/skeletons/skeleton-overview-cards";
import { SkeletonOverviewChart } from "@/components/skeletons/skeleton-overview-chart";
import { SkeletonRecentEvents } from "@/components/skeletons/skeleton-recent-events";
import { Button } from "./ui/button";
import { useStudioAuthStore } from "@/stores/modal-store";
import SiteSelector from "./site-selector";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AuthSplash() {
  const authModal = useStudioAuthStore();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 min-h-screen relative overflow-hidden">
      {/* Overlay for Splash */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-6 text-center h-full z-10">
        <p className="text-lg font-medium text-foreground">
          Studio Key is required to access this feature. You can find it on your
          server.
        </p>
        <Link
          href="https://keptcodes.github.io/StatStream/docs/v1/studio/analytics-studio-setup"
          className="text-sm text-muted-foreground hover:underline"
        >
          How to find your Studio Key?
        </Link>
        <Button
          variant="outline"
          onClick={() => authModal.onOpen()}
          className="mt-2"
        >
          Connect Your Server
        </Button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <SiteSelector />
          <Button size="icon" variant="default">
            <RefreshCw />
          </Button>
        </div>
      </div>
      {/* Skeleton Loading Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonOverviewCards />
      </div>
      {/* Skeleton Loading Chart and Recent Events */}
      <div className="hidden lg:grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <SkeletonOverviewChart />
        <SkeletonRecentEvents />
      </div>
    </div>
  );
}
