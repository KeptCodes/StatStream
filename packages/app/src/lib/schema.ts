import { z } from "zod";

export enum EventType {
  PageView = "pageview",
  Click = "click",
  FormSubmission = "form_submission",
  TimeOnPage = "time_on_page",
  Leave = "leave",
  Scroll = "scroll",
}

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
  additionalData: z.any().optional(),
});
