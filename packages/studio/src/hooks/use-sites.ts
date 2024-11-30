"use client";

import { SERVER_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
export default function useSites() {
  const token = Cookies.get("studio_key");
  const { data, error, isLoading, status, refetch } = useQuery({
    enabled: token != null,
    queryKey: ["sites_data"],
    queryFn: async () => {
      const authHeaders = {
        "x-studio-key": token ?? "",
      };
      try {
        const response = await fetch(`${SERVER_URL}/api/sites`, {
          headers: authHeaders,
        });
        const body = await response.json(); // Parse the response body

        if (response.status == 200) {
          return body as Site[];
        } else {
          throw new Error(body.message);
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  });

  return {
    data,
    error,
    isLoading,
    status,
    refetch,
  };
}
