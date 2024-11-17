import {
  Client,
  Guild,
  TextChannel,
  Collection,
  GuildChannelManager,
  ChannelType,
} from "discord.js";

// Mocked constants (for channel names, IDs, etc.)
export const channels = {
  CONFIG: "config",
  ADDSITES: "add-sites",
};

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

const site = {
  url: "https://example.com",
  name: "Example Site",
  description: "Description of the site",
};

// Mocked channel
export const mockConfigChannel = {
  id: "mock-config-channel-id",
  name: channels.CONFIG,
  type: ChannelType.GuildText,
  send: jest.fn().mockResolvedValue(true),
  messages: {
    fetch: jest.fn(),
  },
} as unknown as jest.Mocked<any>;

// Mocked channel
export const mockAddSiteChannel = {
  id: "mock-addsite-channel-id",
  name: channels.ADDSITES,
  type: ChannelType.GuildText,
  send: jest.fn(),
  messages: {
    fetch: jest.fn(),
  },
} as unknown as jest.Mocked<TextChannel>;

// Mock implementation of fetching a guild in the client
mockClient.guilds.fetch = jest.fn().mockResolvedValue(mockGuild);
mockConfigChannel.messages.fetch = jest.fn().mockResolvedValue([
  {
    content: `\`\`\`json\n${JSON.stringify(site)}\n\`\`\``, // Initial message
    edit: jest.fn().mockResolvedValue(true), // Mock successful edit
    delete: jest.fn().mockResolvedValue(true), // Mock successful edit
  },
]);
