import {
  Client,
  Guild,
  TextChannel,
  Collection,
  GuildChannelManager,
  ChannelType,
} from "discord.js";

// Mocked Discord.js client
export const mockClient = {
  guilds: {
    fetch: jest.fn().mockResolvedValue({}),
  },
  user: {
    id: "user-id",
  },
} as unknown as jest.Mocked<Client<true>>;

// Mocked guild
export const mockGuild = {
  id: "mock-guild-id",
  channels: {
    cache: new Collection(),
    create: jest.fn(),
  } as unknown as jest.Mocked<GuildChannelManager>,
} as unknown as jest.Mocked<Guild>;

// Mocked constants (for channel names, IDs, etc.)
export const channels = {
  CONFIG: "config",
  ADDSITES: "add-sites",
};

// Mocked channel
export const mockConfigChannel = {
  id: "mock-config-channel-id",
  name: channels.CONFIG,
  type: ChannelType.GuildText, // GuildText
  send: jest.fn(),
  messages: {
    fetch: jest.fn(),
  },
} as unknown as jest.Mocked<TextChannel>;

// Mocked channel
export const mockAddSiteChannel = {
  id: "mock-addsite-channel-id",
  name: channels.ADDSITES,
  type: ChannelType.GuildText, // GuildText
  send: jest.fn(),
  messages: {
    fetch: jest.fn(),
  },
} as unknown as jest.Mocked<TextChannel>;

// Mock implementation of fetching a guild in the client
mockClient.guilds.fetch = jest.fn().mockResolvedValue(mockGuild);
