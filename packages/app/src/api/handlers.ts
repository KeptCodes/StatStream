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
      timestamp: timestamp,
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
