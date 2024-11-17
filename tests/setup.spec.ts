import {
  ActionRowBuilder,
  ChannelType,
  Collection,
  GuildMessageManager,
  Message,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import {
  rebuildSitesConfig,
  setupAddSitesChannel,
  setupConfigChannel,
} from "../src/discord/setup";
import { channels } from "../src/lib/constants";
import { sitesConfig } from "../src/lib/sitesConfig";
import {
  mockClient,
  mockGuild,
  mockAddSiteChannel,
  mockConfigChannel,
} from "./mocks.test"; // Assume you have these mocks

describe("setupConfigChannel", () => {
  beforeEach(() => {
    mockGuild.channels.cache.set(channels.CONFIG, mockConfigChannel);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a "config" channel if it does not exist', async () => {
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockGuild.channels.cache.set(channels.ADDSITES, mockAddSiteChannel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an "add-sites" channel if it does not exist', async () => {
    mockGuild.channels.cache.delete(channels.ADDSITES);
    (mockGuild.channels.create as jest.Mock).mockResolvedValue(
      mockAddSiteChannel
    );

    const result = await setupAddSitesChannel(mockClient);

    expect(mockGuild.channels.create).toHaveBeenCalledWith({
      name: channels.ADDSITES,
      type: ChannelType.GuildText,
      topic: "Use this channel to add new sites for analytics tracking.",
      permissionOverwrites: expect.any(Array),
    });
    expect(result).toBeUndefined(); // Function does not return anything
  });

  it('should send an interactive message with buttons if the "add-sites" channel exists', async () => {
    const mockSend = jest.fn();
    mockAddSiteChannel.send = mockSend;

    await setupAddSitesChannel(mockClient);

    expect(mockSend).toHaveBeenCalledWith({
      content:
        "Click a button below to add, edit, or delete a site for analytics tracking.",
      components: [expect.any(ActionRowBuilder)],
    });
  });

  it("should handle invalid channel type gracefully", async () => {
    const invalidChannel = {
      ...mockAddSiteChannel,
      type: ChannelType.GuildVoice,
    } as unknown as VoiceChannel;

    mockGuild.channels.cache.set(channels.ADDSITES, invalidChannel);

    await setupAddSitesChannel(mockClient);

    expect(mockAddSiteChannel.send).not.toHaveBeenCalled();
  });
});

describe("rebuildSitesConfig", () => {
  beforeEach(() => {
    sitesConfig.length = 0;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should rebuild site configurations from the "config" channel', async () => {
    const mockMessages = new Collection<string, Message>();
    mockMessages.set("message-id-1", {
      id: "message-id-1",
      content: '```json\n{"name":"Test Site"}\n```',
      author: {} as any, // Add any other properties required by your test.
      channel: {} as any,
      createdTimestamp: Date.now(),
      editedTimestamp: null,
      fetch: jest.fn(),
      delete: jest.fn(),
    } as unknown as Message);

    const mockMessageManager = {
      fetch: jest.fn().mockResolvedValue(mockMessages),
    } as unknown as jest.Mocked<GuildMessageManager>;

    const mockChannel = {
      ...mockConfigChannel,
      messages: mockMessageManager,
    } as unknown as VoiceChannel;

    mockGuild.channels.cache.set("config", mockChannel);

    await rebuildSitesConfig(mockClient);

    expect(sitesConfig).toEqual([{ name: "Test Site" }]);
  });

  it("should warn and skip invalid configuration messages", async () => {
    const mockMessages = new Collection<string, Message>();
    mockMessages.set("message-id-1", {
      id: "message-id-1",
      content: "Invalid JSON",
      author: {} as any,
      channel: {} as any,
      createdTimestamp: Date.now(),
      editedTimestamp: null,
      fetch: jest.fn(),
      delete: jest.fn(),
    } as unknown as Message);

    const mockMessageManager = {
      fetch: jest.fn().mockResolvedValue(mockMessages),
    } as unknown as jest.Mocked<GuildMessageManager>;

    const mockChannel = {
      ...mockConfigChannel,
      messages: mockMessageManager,
    } as unknown as TextChannel;

    mockGuild.channels.cache.set(channels.CONFIG, mockChannel);

    console.warn = jest.fn();

    await rebuildSitesConfig(mockClient);

    expect(console.warn).toHaveBeenCalledWith(
      "Skipping invalid configuration message:",
      expect.any(Error)
    );
    expect(sitesConfig).toEqual([]);
  });

  it("should handle missing config channel gracefully", async () => {
    mockGuild.channels.cache.clear();

    console.warn = jest.fn();

    await rebuildSitesConfig(mockClient);

    expect(console.warn).toHaveBeenCalledWith(
      'The "config" channel does not exist.'
    );
  });

  it("should handle empty configuration messages gracefully", async () => {
    const mockMessages = new Collection<string, Message>();
    mockMessages.set("message-id-1", {
      id: "message-id-1",
      content: "```json\n{}\n```", // Empty config
      author: {} as any,
      channel: {} as any,
      createdTimestamp: Date.now(),
      editedTimestamp: null,
      fetch: jest.fn(),
      delete: jest.fn(),
    } as unknown as Message);

    const mockMessageManager = {
      fetch: jest.fn().mockResolvedValue(mockMessages),
    } as unknown as jest.Mocked<GuildMessageManager>;

    const mockChannel = {
      ...mockConfigChannel,
      messages: mockMessageManager,
    } as unknown as TextChannel;

    mockGuild.channels.cache.set(channels.CONFIG, mockChannel);

    await rebuildSitesConfig(mockClient);

    expect(sitesConfig).toEqual([{}]);
  });
});
