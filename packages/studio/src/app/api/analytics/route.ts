import { DashboardData } from "@/hooks/useAnalyticsData";
import { NextResponse } from "next/server";

// const dashboardData = {
//   overview: {
//     totalPageViews: 1234567,
//     uniqueVisitors: 456789,
//     avgSessionDuration: "2m 45s",
//     bounceRate: 32.5,
//   },
//   monthlyData: [
//     { month: "Jan", value: 1500 },
//     { month: "Feb", value: 6000 },
//     { month: "Mar", value: 3000 },
//     { month: "Apr", value: 4500 },
//     { month: "May", value: 3500 },
//     { month: "Jun", value: 5000 },
//     { month: "Jul", value: 6000 },
//     { month: "Aug", value: 4000 },
//     { month: "Sep", value: 4500 },
//     { month: "Oct", value: 5000 },
//     { month: "Nov", value: 5500 },
//     { month: "Dec", value: 2000 },
//   ],
//   recentEvents: [
//     { name: "Olivia Martin", action: "Viewed homepage", timeAgo: "2 mins ago" },
//     {
//       name: "Jackson Lee",
//       action: "Clicked on product page",
//       timeAgo: "5 mins ago",
//     },
//     {
//       name: "Isabella Nguyen",
//       action: "Added item to cart",
//       timeAgo: "10 mins ago",
//     },
//     {
//       name: "William Kim",
//       action: "Completed checkout",
//       timeAgo: "15 mins ago",
//     },
//     {
//       name: "Sofia Davis",
//       action: "Submitted a review",
//       timeAgo: "20 mins ago",
//     },
//   ],
//   topPages: [
//     { page: "/", views: 12345, uniqueVisitors: 9876 },
//     { page: "/products", views: 8765, uniqueVisitors: 7654 },
//     { page: "/about", views: 5432, uniqueVisitors: 4321 },
//     { page: "/blog", views: 3210, uniqueVisitors: 2109 },
//     { page: "/contact", views: 1098, uniqueVisitors: 987 },
//   ],
//   topReferrers: [
//     { source: "Google", visits: 5678, percentage: 45.6 },
//     { source: "Direct", visits: 2345, percentage: 18.9 },
//     { source: "Facebook", visits: 1234, percentage: 9.9 },
//     { source: "Twitter", visits: 987, percentage: 7.9 },
//     { source: "LinkedIn", visits: 654, percentage: 5.3 },
//   ],
// };

export async function GET() {
  try {
    const authheaders = {
      "x-studio-key": "studio-api-key",
    };

    const response = await fetch("http://localhost:8000/api/dashboard", {
      headers: authheaders,
    });
    const data: DashboardData = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
