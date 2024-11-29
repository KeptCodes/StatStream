type Overview = {
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
};

// Define the structure of the monthly data
type MonthlyData = {
  month: string;
  desktop: number;
  mobile: number;
};

// Define the structure of recent events
type RecentEvent = {
  name: string;
  action: string;
  timeAgo: string;
};

// Define the structure of top pages
type TopPage = {
  page: string;
  views: number;
  mobileVisits: number;
  desktopVisits: number;
  desktopUniqueVisitors: number;
  mobileUniqueVisitors: number;
  uniqueVisitors: number;
};

// Define the structure of top referrers
type TopReferrer = {
  source: string;
  visits: number;
  mobileVisits: number;
  desktopVisits: number;
  percentage: number;
};

// Define the full dashboard data structure
type DashboardData = {
  overview: Overview;
  monthlyData: MonthlyData[];
  recentEvents: RecentEvent[];
  topPages: TopPage[];
  topReferrers: TopReferrer[];
};

type Site = {
  id: string;
  name: string;
  description: string | null;
  url: string;
};
