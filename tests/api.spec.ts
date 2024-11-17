import { ChannelType } from "discord.js";
import request from "supertest";
import { sitesConfig } from "../src/lib/sitesConfig";
import { fetchLocationData } from "../src/lib/utils";
import client from "../src/lib/discord";
import server from "../src/lib/server";

// Mocking Discord client
jest.mock("../src/lib/discord", () => ({
  __esModule: true,
  default: {
    channels: {
      fetch: jest.fn(),
    },
    user: {
      id: "user-id",
    },
  },
}));

// Mocking location fetching
jest.mock("../src/lib/utils", () => ({
  fetchLocationData: jest.fn(),
}));

describe("API Handlers Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  sitesConfig.push({
    channelID: "channel-id",
    url: "http://localhost:3000",
    description: "Des",
    name: "Local",
  });
  describe("trackAction Handler", () => {
    const mockValidData = {
      eventType: "pageview",
      page: "/home",
      referrer: "https://google.com",
      timestamp: new Date().toISOString(),
      sessionId: "123456",
      url: sitesConfig[0].url,
      deviceInfo: {
        platform: "Windows",
        language: "en-US",
        userAgent: "Mozilla/5.0",
      },
    };

    const mockLocationData = {
      city: "New York",
      country: "US",
      region: "NY",
    };

    beforeEach(() => {
      (fetchLocationData as jest.Mock).mockResolvedValue(mockLocationData);

      const mockChannel = {
        type: ChannelType.GuildText,
        send: jest.fn().mockResolvedValue(true),
      };
      (client.channels.fetch as jest.Mock).mockResolvedValue(mockChannel);
    });

    it("should track event successfully", async () => {
      const response = await request(server).post("/track").send(mockValidData);

      expect(response.status).toBe(200);
      expect(response.text).toBe("Event tracked successfully");
      expect(client.channels.fetch).toHaveBeenCalledWith(
        sitesConfig[0].channelID
      );
    });

    it("should return 400 on validation error", async () => {
      const invalidData = {
        ...mockValidData,
        eventType: undefined,
      };

      const response = await request(server).post("/track").send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toHaveLength(1);
    });

    it("should return 400 if site is not found", async () => {
      const unknownSiteData = {
        ...mockValidData,
        url: "https://unknown-site.com",
      };

      const response = await request(server)
        .post("/track")
        .send(unknownSiteData);

      expect(response.status).toBe(400);
      expect(response.text).toBe("Site not found");
    });

    it("should return 500 if channel fetch fails", async () => {
      const mockErrorChannel = new Error("Channel not found");
      (client.channels.fetch as jest.Mock).mockRejectedValue(mockErrorChannel);

      const response = await request(server).post("/track").send(mockValidData);

      expect(response.status).toBe(500);
      expect(response.text).toBe("Error tracking event");
    });
    it("should return 500 and 'Channel not found' when the channel does not exist", async () => {
      (client.channels.fetch as jest.Mock).mockResolvedValue(null);

      const response = await request(server).post("/track").send(mockValidData);

      expect(response.status).toBe(500);
      expect(response.text).toBe("Channel not found");
    });
  });

  describe("sendAnalytics Handler", () => {
    const mockMessages = new Map();
    mockMessages.set("1", {
      content:
        '```json\n{"event":"pageview","page":"/home","session_id":"123","referrer":"google.com","timestamp":"2024-01-01T00:00:00Z","device_info":"Windows, en-US, Chrome","location":{"city":"New York","country":"US"}}\n```',
    });
    mockMessages.set("2", {
      content:
        '```json\n{"event":"click","page":"/about","session_id":"124","referrer":"facebook.com","timestamp":"2024-01-01T00:00:00Z","device_info":"Mac, en-US, Safari","location":{"city":"London","country":"UK"}}\n```',
    });

    beforeEach(() => {
      const mockMessages = new Map();
      mockMessages.set("1", {
        content:
          '```json\n{"event":"pageview","page":"/home","session_id":"123","referrer":"google.com","timestamp":"2024-01-01T00:00:00Z","device_info":"Windows, en-US, Chrome","location":{"city":"New York","country":"US"}}\n```',
      });
      const mockChannel = {
        type: ChannelType.GuildText,
        messages: {
          fetch: jest.fn().mockResolvedValue(mockMessages),
        },
      };
      (client.channels.fetch as jest.Mock).mockResolvedValue(mockChannel);
    });
    it("should skip channel if not found", async () => {
      (client.channels.fetch as jest.Mock).mockResolvedValue(null); // Simulating channel not found

      const response = await request(server).get("/analytics");

      expect(response.status).toBe(200); // Still success because it skips the channel
      expect(response.body).toEqual({});
    });

    it("should skip non-GuildText channels", async () => {
      const mockChannel = {
        type: ChannelType.DM, // Non-GuildText channel type
        messages: {
          fetch: jest.fn().mockResolvedValue(mockMessages),
        },
      };

      (client.channels.fetch as jest.Mock).mockResolvedValue(mockChannel);

      const response = await request(server).get("/analytics");

      expect(response.status).toBe(200); // No data for this channel, still success
      expect(response.body).toEqual({});
    });

    it("should return analytics data successfully", async () => {
      const response = await request(server).get("/analytics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(sitesConfig[0].name);
      const siteData = response.body[sitesConfig[0].name];
      expect(siteData).toHaveProperty("totalEvents");
      expect(siteData).toHaveProperty("uniqueSessions");
      expect(siteData).toHaveProperty("pageViews");
      expect(siteData).toHaveProperty("referrers");
      expect(siteData).toHaveProperty("locations");
    });
    it("should skip invalid JSON messages", async () => {
      mockMessages.set("invalid", {
        content: '```json\n{"invalidJson":}',
      }); // Invalid JSON

      const mockChannel = {
        type: ChannelType.GuildText,
        messages: {
          fetch: jest.fn().mockResolvedValue(mockMessages),
        },
      };

      (client.channels.fetch as jest.Mock).mockResolvedValue(mockChannel);

      const response = await request(server).get("/analytics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(sitesConfig[0].name);
      const siteData = response.body[sitesConfig[0].name];
      expect(siteData).toHaveProperty("totalEvents", 2);
    });

    it("should return 500 on general errors", async () => {
      (client.channels.fetch as jest.Mock).mockRejectedValue(
        new Error("Discord API Error")
      );

      const response = await request(server).get("/analytics");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to fetch analytics data");
    });
  });
});
