import { z } from "zod";

export const TrackedDataSchema = z.object({
  eventType: z.string(),
  page: z.string(),
  referrer: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
  url: z.string(),
  deviceInfo: z.object({
    language: z.string(),
    platform: z.string(),
    userAgent: z.string(),
  }),
});
