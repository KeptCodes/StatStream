"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Define the structure of the overview metrics
export interface Overview {
  totalPageViews: number;
  uniqueVisitors: {
    total: number;
    desktop: number;
    mobile: number;
  };
  avgSessionDuration: {
    total: string;
    desktop: string;
    mobile: string;
  };
  bounceRate: {
    total: number;
    desktop: number;
    mobile: number;
  };
}

// Define the structure of the monthly data
export interface MonthlyData {
  month: string;
  desktop: number;
  mobile: number;
}

// Define the structure of recent events
export interface RecentEvent {
  name: string;
  action: string;
  timeAgo: string;
}

// Define the structure of top pages
export interface TopPage {
  page: string;
  views: number;
  mobileVisits: number;
  desktopVisits: number;
  desktopUniqueVisitors: number;
  mobileUniqueVisitors: number;
  uniqueVisitors: number;
}

// Define the structure of top referrers
export interface TopReferrer {
  source: string;
  visits: number;
  mobileVisits: number;
  desktopVisits: number;
  percentage: number;
}

// Define the full dashboard data structure
export interface DashboardData {
  overview: Overview;
  monthlyData: MonthlyData[];
  recentEvents: RecentEvent[];
  topPages: TopPage[];
  topReferrers: TopReferrer[];
}

const useAnalyticsData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get<DashboardData>("/api/analytics");
        setData(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { data, loading, error };
};

export default useAnalyticsData;
