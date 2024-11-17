import { Request, Response } from "express";
import { TrackedDataSchema } from "../lib/schema";
import { fetchLocationData } from "../lib/utils";
import { sitesConfig } from "../lib/sitesConfig";
import client from "../lib/discord";
import { ChannelType, TextChannel } from "discord.js";

export const trackAction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { success, data, error } = TrackedDataSchema.safeParse(req.body);

    if (!success || !data) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join("."), // This creates a dot notation path (e.g., 'user.name')
        message: err.message, // The error message
      }));
      res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
      return;
    }
    const locationData = await fetchLocationData(req);

    const site = sitesConfig.find((site) => site.url === data.url);
    if (!site) {
      res.status(400).send("Site not found");
      return;
    }
    const timestamp = new Date(data.timestamp);
    const messageData: AnalyticsEvent = {
      event: data.eventType,
      page: data.page,
      referrer: data.referrer,
      timestamp: timestamp,
      session_id: data.sessionId,
      device_info: `${data.deviceInfo.platform}, ${data.deviceInfo.language}, ${data.deviceInfo.userAgent}`,
      location: locationData,
    };

    const channel = (await client.channels.fetch(
      site.channelID
    )) as TextChannel;

    if (channel) {
      await channel.send(
        `\`\`\`json\n${JSON.stringify(messageData, null, 2)}\n\`\`\``
      );
      res.status(200).send("Event tracked successfully");
    } else {
      res.status(500).send("Channel not found");
    }
  } catch (error) {
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
        continue;
      }
      if (channel.type != ChannelType.GuildText) {
        continue;
      }

      const messages = await channel.messages.fetch({ limit: 50 });
      const siteData: AnalyticsEvent[] = [];

      messages.forEach((message) => {
        try {
          const jsonData = JSON.parse(
            message.content.replace(/```json|```/g, "").trim()
          );
          siteData.push(jsonData);
        } catch (error) {}
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

      // Add aggregated data to dashboard
      dashboardData[site.name] = aggregatedData;
    }

    // Send the collected analytics data
    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};
