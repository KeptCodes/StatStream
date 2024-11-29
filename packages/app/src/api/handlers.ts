import { Request, Response } from "express";
import { TrackedDataSchema } from "../lib/schema";
import { fetchLocationData, minify } from "../lib/utils";
import { sitesConfig } from "../lib/sitesConfig";
import client from "../lib/discord";
import { ChannelType, TextChannel } from "discord.js";
import logger from "../lib/logger";
import { getDeviceInfo, getSessionId } from "../scripts/utilities";
import { sendAnalyticsFn, trackUserBehavior } from "../scripts/core";

export const trackAction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { success, data, error } = TrackedDataSchema.safeParse(req.body);
    if (!success || !data) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join("."), // Dot notation path
        message: err.message, // Error message
      }));
      logger.warn("Validation failed for tracked data", { formattedErrors });
      res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
      return;
    }
    const originUrl = req.headers.origin;

    const locationData = await fetchLocationData(req);
    logger.debug("Fetched location data", { locationData });

    const site = sitesConfig.find((site) => site.url === originUrl);
    if (!site) {
      logger.warn(`Site not found for URL: ${data.url}`);
      res.status(400).send("Site not found");
      return;
    }

    const timestamp = new Date(data.timestamp);
    const messageData: AnalyticsEvent = {
      event: data.eventType,
      page: data.page,
      referrer: data.referrer,
      timestamp: timestamp.toTimeString(),
      session_id: data.sessionId,
      device_info: `${data.deviceInfo.platform}, ${data.deviceInfo.language}, ${data.deviceInfo.userAgent}`,
      location: locationData,
      additionalData: data.additionalData,
    };

    const channel = (await client.channels.fetch(
      site.channelID
    )) as TextChannel;

    if (channel) {
      logger.info("Sending event data to Discord channel", {
        channelID: site.channelID,
        messageData,
      });
      await channel.send(
        `\`\`\`json\n${JSON.stringify(messageData, null, 2)}\n\`\`\``
      );
      res.status(200).send("Event tracked successfully");
    } else {
      logger.error("Discord channel not found", { channelID: site.channelID });
      res.status(500).send("Channel not found");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error("Error tracking event", { error: errorMessage });
    res.status(500).send("Error tracking event");
  }
};

export const sendAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const dashboardData: DashboardData = {};

    // Loop through each site in the configuration
    for (const site of sitesConfig) {
      const channel = await client.channels.fetch(site.channelID);
      if (!channel) {
        logger.warn("Channel not found", { channelID: site.channelID });
        continue;
      }

      if (channel.type !== ChannelType.GuildText) {
        logger.warn("Channel is not a text channel", {
          channelID: site.channelID,
        });
        continue;
      }

      const messages = await (channel as TextChannel).messages.fetch({
        limit: 50,
      });
      const siteData: AnalyticsEvent[] = [];

      messages.forEach((message) => {
        try {
          const jsonData = JSON.parse(
            message.content.replace(/```json|```/g, "").trim()
          );
          siteData.push(jsonData);
        } catch (error) {
          const parseErrorMessage =
            error instanceof Error
              ? error.message
              : "An unknown error occurred while parsing message";
          logger.debug("Failed to parse message as JSON", {
            messageID: message.id,
            error: parseErrorMessage,
          });
        }
      });

      // Aggregate data for this site
      const aggregatedData: AggregatedAnalytics = {
        totalEvents: siteData.length,
        uniqueSessions: new Set(siteData.map((data) => data.session_id)).size,
        pageViews: {},
        referrers: {},
        locations: {},
      };

      siteData.forEach((data) => {
        // Count page views
        aggregatedData.pageViews[data.page] =
          (aggregatedData.pageViews[data.page] || 0) + 1;

        // Count referrers
        if (data.referrer) {
          aggregatedData.referrers[data.referrer] =
            (aggregatedData.referrers[data.referrer] || 0) + 1;
        }

        // Count locations by city
        const locationKey = `${data.location.city}, ${data.location.country}`;
        aggregatedData.locations[locationKey] =
          (aggregatedData.locations[locationKey] || 0) + 1;
      });

      logger.info("Aggregated analytics for site", {
        site: site.name,
        aggregatedData,
      });

      // Add aggregated data to dashboard
      dashboardData[site.name] = aggregatedData;
    }

    // Send the collected analytics data
    logger.info("Sending aggregated analytics data", { dashboardData });
    res.status(200).json(dashboardData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error("Failed to fetch analytics data", { error: errorMessage });
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

export const trackingScript = async (req: Request, res: Response) => {
  const trackingUrl = `https://${req.get("host")}/track`;
  let script = `
    (function () {
      ${getSessionId}
      ${getDeviceInfo}
      const sessionId = getSessionId();
      ${sendAnalyticsFn(trackingUrl)}
`;

  // TODO! ADD FEATURES
  script += trackUserBehavior;

  script += `
      sendAnalytics("pageview");
      window.addEventListener("beforeunload", () => {
        sendAnalytics("leave");
      });
    })();
  `;

  try {
    const minified = await minify(script);
    res.type("application/javascript").send(minified.code);
  } catch (error) {
    logger.error("Minification error:", error);
    res.status(500).send("Error generating the script");
  }
};

export const sendSites = async (_: Request, res: Response): Promise<void> => {
  try {
    const data = sitesConfig.map((site) => {
      return {
        id: site.channelID,
        name: site.name,
        description: site.description,
        url: site.url,
      };
    });

    res.status(200).json(data);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error("Failed to fetch sites data", { error: errorMessage });
    res.status(500).json({ error: "Failed to fetch sites data" });
  }
};

export const sendSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const { limit, after } = req.query;

    const site = sitesConfig.find((s) => s.channelID === channelId);

    if (!site) {
      res.status(404).json({
        message: "Site not found. Check Id",
      });
      return;
    }
    const channel = await client.channels.fetch(site.channelID);
    if (!channel) {
      logger.warn("Channel not found", { channelID: site.channelID });
      return;
    }
    if (channel.type !== ChannelType.GuildText) {
      logger.warn("Channel is not a text channel", {
        channelID: site.channelID,
      });
      return;
    }
    const messages = await (channel as TextChannel).messages.fetch({
      limit: limit ? parseInt(limit as string) : 50,
      before: after as string,
    });
    const siteData: AnalyticsEvent[] = [];
    messages
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .forEach((message) => {
        try {
          const jsonData = JSON.parse(
            message.content.replace(/```json|```/g, "").trim()
          );
          siteData.push({ id: message.id, ...jsonData });
        } catch (error) {
          const parseErrorMessage =
            error instanceof Error
              ? error.message
              : "An unknown error occurred while parsing message";
          logger.debug("Failed to parse message as JSON", {
            messageID: message.id,
            error: parseErrorMessage,
          });
        }
      });

    res.status(200).json(siteData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error("Failed to fetch site data", { error: errorMessage });
    res.status(500).json({ error: "Failed to fetch site data" });
  }
};

// Function to send analytics
export const sendDashboardData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.query.site;
    const siteData: AnalyticsEvent[] = [];

    if (id) {
      const channel = await client.channels.fetch(id as string);
      if (!channel) {
        logger.warn("Channel not found", { channelID: id });
        return;
      }
      if (channel.type !== ChannelType.GuildText) {
        logger.warn("Channel is not a text channel", {
          channelID: id,
        });
        return;
      }

      let lastMessageID: string | undefined;
      let messagesFetched = 0;

      // Fetch messages in batches of 100 until 1000 messages are fetched
      while (messagesFetched < 1000) {
        const messages = await (channel as TextChannel).messages.fetch({
          limit: 100,
          before: lastMessageID,
        });

        if (messages.size === 0) break; // Exit loop if no more messages are available

        messages.forEach((message) => {
          try {
            const jsonData = JSON.parse(
              message.content.replace(/```json|```/g, "").trim()
            ) as AnalyticsEvent;
            siteData.push(jsonData);
          } catch (error) {
            const parseErrorMessage =
              error instanceof Error
                ? error.message
                : "An unknown error occurred while parsing message";
            logger.debug("Failed to parse message as JSON", {
              messageID: message.id,
              error: parseErrorMessage,
            });
          }
        });

        // Update lastMessageID to the ID of the last fetched message
        lastMessageID = messages.last()?.id;

        messagesFetched += messages.size;
      }
    } else {
      for (const site of sitesConfig) {
        const channel = await client.channels.fetch(site.channelID);
        if (!channel) {
          logger.warn("Channel not found", { channelID: site.channelID });
          continue;
        }

        if (channel.type !== ChannelType.GuildText) {
          logger.warn("Channel is not a text channel", {
            channelID: site.channelID,
          });
          continue;
        }

        let lastMessageID: string | undefined;
        let messagesFetched = 0;

        // Fetch messages in batches of 100 until 1000 messages are fetched
        while (messagesFetched < 1000) {
          const messages = await (channel as TextChannel).messages.fetch({
            limit: 100,
            before: lastMessageID,
          });
          if (messages.size === 0) break; // Exit loop if no more messages are available

          messages.forEach((message) => {
            try {
              const jsonData = JSON.parse(
                message.content.replace(/```json|```/g, "").trim()
              ) as AnalyticsEvent;
              siteData.push(jsonData);
            } catch (error) {
              const parseErrorMessage =
                error instanceof Error
                  ? error.message
                  : "An unknown error occurred while parsing message";
              logger.debug("Failed to parse message as JSON", {
                messageID: message.id,
                error: parseErrorMessage,
              });
            }
          });

          // Update lastMessageID to the ID of the last fetched message
          lastMessageID = messages.last()?.id;

          messagesFetched += messages.size;
        }
      }
    }

    const dashboardData = aggregateDashboardData(siteData);

    // Send the collected analytics data
    logger.info("Sending aggregated analytics data", { dashboardData });
    res.status(200).json(dashboardData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error("Failed to fetch analytics data", { error: errorMessage });
    console.log(error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

function aggregateDashboardData(events: AnalyticsEvent[]) {
  // Helper to parse timestamps
  const parseDate = (timestamp: string) => new Date(timestamp);

  // Helper to calculate average session duration
  const calculateAvgSessionDuration = (durations: number[]) => {
    if (durations.length === 0) return "0s";
    const totalSeconds = durations.reduce((a, b) => a + b, 0);
    const avgSeconds = totalSeconds / durations.length;
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = Math.floor(avgSeconds % 60);
    return `${minutes}m ${seconds}s`;
  };

  // Overview data
  const totalPageViews = { desktop: 0, mobile: 0 };
  const uniqueVisitorsSet = {
    desktop: new Set<string>(),
    mobile: new Set<string>(),
  };
  const sessionDurations = { desktop: [] as number[], mobile: [] as number[] };
  const bounces = { desktop: 0, mobile: 0 };

  // Monthly data
  const monthlyDataMap: Record<string, { desktop: number; mobile: number }> =
    {};
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Top pages and referrers
  const pageViewMap: Record<
    string,
    {
      desktop: { views: number; uniqueVisitors: Set<string> };
      mobile: { views: number; uniqueVisitors: Set<string> };
    }
  > = {};
  const referrerMap: Record<string, { desktop: number; mobile: number }> = {};

  // Recent events
  const recentEvents: { name: string; action: string; timeAgo: string }[] = [];

  // Current time for "time ago" calculations
  const now = new Date();

  // Helper function to determine if the device is mobile or desktop
  const isMobileDevice = (deviceInfo: string) => /mobile/i.test(deviceInfo);

  // Process each event
  for (const event of events) {
    const deviceType = isMobileDevice(event.device_info) ? "mobile" : "desktop";
    totalPageViews[deviceType]++;
    uniqueVisitorsSet[deviceType].add(event.session_id);

    // Process sessions and bounces
    if (event.event === "time_on_page" && event.additionalData?.seconds) {
      sessionDurations[deviceType].push(event.additionalData.seconds);
    }
    if (event.event === "leave" && event.page === "/") {
      bounces[deviceType]++;
    }

    // Count page views
    if (!pageViewMap[event.page]) {
      pageViewMap[event.page] = {
        desktop: { views: 0, uniqueVisitors: new Set() },
        mobile: { views: 0, uniqueVisitors: new Set() },
      };
    }
    pageViewMap[event.page][deviceType].views++;
    pageViewMap[event.page][deviceType].uniqueVisitors.add(event.session_id);

    // Count referrers
    if (event.referrer) {
      referrerMap[event.referrer] = referrerMap[event.referrer] || {
        desktop: 0,
        mobile: 0,
      };
      referrerMap[event.referrer][deviceType]++;
    }

    // Monthly data
    const eventDate = parseDate(event.timestamp);
    const month = monthNames[eventDate.getMonth()];
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { desktop: 0, mobile: 0 };
    }
    monthlyDataMap[month][deviceType]++;

    // Recent events (limit to last 5)
    if (recentEvents.length < 5) {
      const timeAgo = Math.round(
        (now.getTime() - eventDate.getTime()) / (1000 * 60)
      ); // in minutes
      const timeAgoText = (() => {
        if (timeAgo === 0) return "Just now";
        if (timeAgo < 60) return `${timeAgo} mins ago`; // Less than an hour
        if (timeAgo < 1440) return `${Math.floor(timeAgo / 60)} hrs ago`; // Less than a day
        return `${Math.floor(timeAgo / 1440)} days ago`; // More than a day
      })();

      recentEvents.push({
        name: event.session_id, // Replace with user name if available
        action: `Performed event: ${event.event}`,
        timeAgo: timeAgoText,
      });
    }
  }

  // Aggregate results
  const totalPageViewsByMonth = Object.entries(monthlyDataMap).map(
    ([month, value]) => ({
      month,
      desktop: value.desktop,
      mobile: value.mobile,
    })
  );

  const topPages = Object.entries(pageViewMap)
    .map(([page, data]) => ({
      page,
      desktopViews: data.desktop.views,
      mobileViews: data.mobile.views,
      views: data.mobile.views + data.desktop.views,
      uniqueVisitors:
        data.desktop.uniqueVisitors.size + data.mobile.uniqueVisitors.size,
      desktopUniqueVisitors: data.desktop.uniqueVisitors.size,
      mobileUniqueVisitors: data.mobile.uniqueVisitors.size,
    }))
    .sort(
      (a, b) =>
        b.desktopViews + b.mobileViews - (a.desktopViews + a.mobileViews)
    )
    .slice(0, 5);

  const topReferrers = Object.entries(referrerMap)
    .map(([source, visits]) => ({
      source,
      desktopVisits: visits.desktop,
      mobileVisits: visits.mobile,
      visits: visits.desktop + visits.mobile,
      percentage: (
        ((visits.desktop + visits.mobile) /
          (totalPageViews.desktop + totalPageViews.mobile)) *
        100
      ).toFixed(1),
    }))
    .sort(
      (a, b) =>
        b.desktopVisits + b.mobileVisits - (a.desktopVisits + a.mobileVisits)
    )
    .slice(0, 5);

  // Bounce rate
  const bounceRate = {
    desktop: (bounces.desktop / totalPageViews.desktop) * 100,
    mobile: (bounces.mobile / totalPageViews.mobile) * 100,
  };

  return {
    overview: {
      totalPageViews: totalPageViews.desktop + totalPageViews.mobile,
      uniqueVisitors: {
        total: uniqueVisitorsSet.desktop.size + uniqueVisitorsSet.mobile.size, // Total unique visitors for both devices
        desktop: uniqueVisitorsSet.desktop.size,
        mobile: uniqueVisitorsSet.mobile.size,
      },
      avgSessionDuration: {
        total: calculateAvgSessionDuration([
          ...sessionDurations.desktop,
          ...sessionDurations.mobile,
        ]), // Overall average session duration for both devices combined
        desktop: calculateAvgSessionDuration(sessionDurations.desktop),
        mobile: calculateAvgSessionDuration(sessionDurations.mobile),
      },
      bounceRate: {
        total: parseFloat(
          (
            ((bounces.desktop + bounces.mobile) /
              (totalPageViews.desktop + totalPageViews.mobile)) *
            100
          ).toFixed(1)
        ), // Overall bounce rate for both devices
        desktop: parseFloat(bounceRate.desktop.toFixed(1)),
        mobile: parseFloat(bounceRate.mobile.toFixed(1)),
      },
    },
    monthlyData: totalPageViewsByMonth,
    recentEvents,
    topPages,
    topReferrers,
  };
}
