type SiteConfig = {
  url: string;
  name: string;
  description: string | null;
  channelID: string;
};

type LocationData = {
  ip?: string;
  city?: string;
  country?: string;
  zip?: string;
  region?: string;
  lat?: string;
  lon?: string;
  org?: string;
  isp?: string;
  timezone?: string;
};

type AnalyticsEvent = {
  event: string;
  page: string;
  referrer: string;
  session_id: string;
  timestamp: string;
  device_info: string;
  location: LocationData;
  additionalData: Record<string, any>;
};

type AggregatedAnalytics = {
  totalEvents: number;
  uniqueSessions: number;
  pageViews: Record<string, number>;
  referrers: Record<string, number>;
  locations: Record<string, number>;
};

type DashboardData = {
  [siteName: string]: AggregatedAnalytics;
};
