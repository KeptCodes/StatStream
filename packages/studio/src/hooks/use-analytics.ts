"use client";

import { SERVER_URL } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
export default function useAnalyticsData() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site");

  const { data, error, isLoading, status, refetch, fetchStatus } = useQuery({
    queryKey: ["analyticsData", siteId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("studio_key") ?? "studio-api-key";
        const authHeaders = {
          "x-studio-key": token,
        };
        const siteId = searchParams.get("site");
        const q = siteId ? `?site=${siteId}` : "";

        const response = await fetch(`${SERVER_URL}/api/dashboard${q}`, {
          headers: authHeaders,
        });
        const body = await response.json(); // Parse the response body

        if (response.status == 200) {
          return body as DashboardData;
        } else {
          throw new Error(body.message);
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });
  return {
    data,
    error,
    isLoading,
    status,
    refetch,
    fetchStatus,
  };
}