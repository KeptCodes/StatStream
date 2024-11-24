import { z } from "zod";
import { config } from "dotenv";

config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_GUILD_ID: z.string(),
  STUDIO_API_KEY: z.string().default("studio-api-key"),
  PORT: z.coerce.number().min(1000).default(3000),
});

const env = envSchema.parse(process.env);

export default env;
