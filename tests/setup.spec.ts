import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Collection,
  Guild,
  GuildBasedChannel,
  GuildChannelManager,
  GuildMessageManager,
  Message,
  PermissionsBitField,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import {
  rebuildSitesConfig,
  setupAddSitesChannel,
  setupConfigChannel,
} from "../src/discord/setup";
import { channels, ids } from "../src/lib/constants";
import { sitesConfig } from "../src/lib/sitesConfig";

// Mocked dependencies
let mockClient: any;
let mockGuild: Guild;
let mockConfigChannel: TextChannel;
let mockAddSitesChannel: TextChannel;

beforeEach(() => {
  const channelCollection = new Collection<string, TextChannel>();
  mockConfigChannel = {
    id: "config-channel-id",
    name: channels.CONFIG,
    type: ChannelType.GuildText,
    send: jest.fn(),
  } as unknown as TextChannel;

  mockAddSitesChannel = {
    id: "add-sites-channel-id",
    name: channels.ADDSITES,
    type: ChannelType.GuildText,
    send: jest.fn(),
  } as unknown as TextChannel;

  channelCollection.set(channels.CONFIG, mockConfigChannel);

  mockGuild = {
    id: "mock-guild-id",
    channels: {
      cache: channelCollection,
      create: jest.fn(),
    },
  } as unknown as Guild;

  mockClient = {
    guilds: {
      fetch: jest.fn().mockResolvedValue(mockGuild),
    },
    user: { id: "bot-id" },
  };

  jest.clearAllMocks();
});

describe("setupConfigChannel", () => {
  it('should create a "config" channel if it does not exist', async () => {
    // Simulate no existing channel
    mockGuild.channels.cache.delete(channels.CONFIG);
    (mockGuild.channels.create as jest.Mock).mockResolvedValue(
      mockConfigChannel
    );

    const result = await setupConfigChannel(mockClient);

    expect(mockGuild.channels.create).toHaveBeenCalledWith({
      name: channels.CONFIG,
      type: ChannelType.GuildText,
      topic: "Configuration storage for site analytics. Do not edit manually.",
      permissionOverwrites: expect.any(Array),
    });
    expect(result).toBe(mockConfigChannel);
  });

  it('should return the existing "config" channel if it exists', async () => {
    mockGuild.channels.cache.set(channels.CONFIG, mockConfigChannel);

    const result = await setupConfigChannel(mockClient);

    expect(mockGuild.channels.create).not.toHaveBeenCalled();
    expect(result).toBe(mockConfigChannel);
  });

  it("should handle invalid channel type gracefully", async () => {
    const invalidChannel = {
      ...mockConfigChannel,
      type: ChannelType.GuildVoice,
    } as unknown as VoiceChannel;

    mockGuild.channels.cache.set(channels.CONFIG, invalidChannel);

    await setupConfigChannel(mockClient);

    expect(mockGuild.channels.create).not.toHaveBeenCalled();
  });
});

describe("setupAddSitesChannel", () => {
  it('should create an "add-sites" channel if it does not exist', async () => {
    mockGuild.channels.cache.delete(channels.ADDSITES);
    (mockGuild.channels.create as jest.Mock).mockResolvedValue(
      mockAddSitesChannel
    );

    await setupAddSitesChannel(mockClient);

    expect(mockGuild.channels.create).toHaveBeenCalledWith({
      name: channels.ADDSITES,
      type: ChannelType.GuildText,
      topic: "Use this channel to add new sites for analytics tracking.",
      permissionOverwrites: [
        {
          id: mockGuild.id, // @everyone role
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: mockClient.user.id, // Bot
          allow: [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ViewChannel,
          ],
        },
      ],
    });
    expect(mockAddSitesChannel.send).toHaveBeenCalledWith({
      content:
        "Click a button below to add, edit, or delete a site for analytics tracking.",
      components: [expect.any(ActionRowBuilder)],
    });
  });

  it('should skip creating "add-sites" channel if it already exists', async () => {
    mockGuild.channels.cache.set(channels.ADDSITES, mockAddSitesChannel);
    await setupAddSitesChannel(mockClient);

    expect(mockGuild.channels.create).not.toHaveBeenCalled();
    expect(mockAddSitesChannel.send).toHaveBeenCalledWith({
      content:
        "Click a button below to add, edit, or delete a site for analytics tracking.",
      components: [expect.any(ActionRowBuilder)],
    });
  });

  it("should handle invalid channel types gracefully", async () => {
    const invalidChannel = {
      ...mockAddSitesChannel,
      type: ChannelType.GuildVoice,
    } as unknown as VoiceChannel;

    mockGuild.channels.cache.set(channels.ADDSITES, invalidChannel);

    await setupAddSitesChannel(mockClient);

    expect(mockGuild.channels.create).not.toHaveBeenCalled();
    expect(mockAddSitesChannel.send).not.toHaveBeenCalled();
  });

  it("should post an interactive message with buttons", async () => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ids.addButton)
        .setLabel("Add New Site")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(ids.editButton)
        .setLabel("Edit Existing Site")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(ids.deleteButton)
        .setLabel("Delete Site")
        .setStyle(ButtonStyle.Danger)
    );

    // Mock the existing channel in the guild cache
    mockGuild.channels.cache.set(channels.ADDSITES, mockAddSitesChannel);

    await setupAddSitesChannel(mockClient);

    expect(mockAddSitesChannel.send).toHaveBeenCalledWith({
      content:
        "Click a button below to add, edit, or delete a site for analytics tracking.",
      components: [row],
    });
  });
});

jest.mock("../src/lib/sitesConfig", () => ({
  sitesConfig: [],
}));

describe("rebuildSitesConfig", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log a warning if the "config" channel does not exist', async () => {
    // Clear the channels cache (simulate "config" channel not being found)
    mockGuild.channels.cache.clear();

    // Mock console.warn to check if the warning is logged
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    await rebuildSitesConfig(mockClient);
    // Call the function
    await rebuildSitesConfig(mockClient);

    // Ensure the warning is logged
    expect(warnSpy).toHaveBeenCalledWith(
      'The "config" channel does not exist.'
    );

    // Restore the original console.warn
    warnSpy.mockRestore();
  });

  it("should skip processing if the channel type is invalid", async () => {
    mockGuild.channels.cache.set(channels.CONFIG, {
      type: ChannelType.GuildVoice,
    } as GuildBasedChannel);

    await rebuildSitesConfig(mockClient);

    expect(sitesConfig).toEqual([]); // No configurations rebuilt
  });

  it("should rebuild configurations from valid JSON messages", async () => {
    const mockMessages = new Collection<string, Message>();
    mockMessages.set("message-id-1", {
      content: '```json\n{"name":"Test Site"}\n```',
    } as unknown as Message);

    const mockFetch = jest.fn().mockResolvedValue(mockMessages);

    // Mock the `messages` object and assign the mocked fetch method
    mockConfigChannel.messages = {
      fetch: mockFetch,
    } as unknown as GuildMessageManager; // Cast to the appropriate type

    await rebuildSitesConfig(mockClient);

    expect(sitesConfig).toEqual([{ name: "Test Site" }]);
  });

  it("should warn and skip invalid JSON messages", async () => {
    const mockMessages = new Collection<string, Message>();
    mockMessages.set("message-id-1", {
      content: "Invalid JSON",
    } as unknown as Message);

    console.warn = jest.fn();
    const mockFetch = jest.fn().mockResolvedValue(mockMessages);

    // Mock the `messages` object and assign the mocked fetch method
    mockConfigChannel.messages = {
      fetch: mockFetch,
    } as unknown as GuildMessageManager; // Cast to the appropriate type
    mockGuild.channels.cache.set(channels.CONFIG, mockConfigChannel);

    await rebuildSitesConfig(mockClient);

    expect(console.warn).toHaveBeenCalledWith(
      "Skipping invalid configuration message:",
      expect.any(Error)
    );
    expect(sitesConfig).toEqual([]); // No valid configurations
  });

  it("should handle empty configuration messages gracefully", async () => {
    const mockMessages = new Collection<string, Message>();
    mockMessages.set("message-id-1", {
      content: "```json\n{}\n```", // Empty JSON object
    } as unknown as Message);

    const mockFetch = jest.fn().mockResolvedValue(mockMessages);

    // Mock the `messages` object and assign the mocked fetch method
    mockConfigChannel.messages = {
      fetch: mockFetch,
    } as unknown as GuildMessageManager; // Cast to the appropriate type  mockGuild.channels.cache.set(channels.CONFIG, mockConfigChannel);

    await rebuildSitesConfig(mockClient);

    expect(sitesConfig).toEqual([{}]); // Push empty object to sitesConfig
  });

  it("should process multiple valid messages correctly", async () => {
    const mockMessages = new Collection<string, Message>();
    mockMessages.set("message-id-1", {
      content: '```json\n{"name":"Site 1"}\n```',
    } as unknown as Message);
    mockMessages.set("message-id-2", {
      content: '```json\n{"name":"Site 2"}\n```',
    } as unknown as Message);

    const mockFetch = jest.fn().mockResolvedValue(mockMessages);

    // Mock the `messages` object and assign the mocked fetch method
    mockConfigChannel.messages = {
      fetch: mockFetch,
    } as unknown as GuildMessageManager; // Cast to the appropriate type
    mockGuild.channels.cache.set(channels.CONFIG, mockConfigChannel);

    await rebuildSitesConfig(mockClient);

    expect(sitesConfig).toEqual([{ name: "Site 1" }, { name: "Site 2" }]);
  });
});
