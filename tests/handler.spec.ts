import {
  expect,
  jest,
  it,
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { ChannelType, InteractionType } from "discord.js";

import {
  handleSubmissions,
  addSiteForm,
  editSiteForm,
  deleteSiteForm,
  addSiteSubmission,
  editSiteSubmission,
  deleteSiteSubmission,
  handleModals,
} from "../src/discord/interaction";
import { sitesConfig } from "../src/lib/sitesConfig";
import * as interactionModule from "../src/discord/interaction";

const ids = {
  addSiteModal: "add-site-modal",
  editSiteModal: "edit-site-modal",
  deleteSiteModal: "delete-site-modal",
  siteURL: "site-url",
  oldSiteURL: "old-site-url",
  newSiteURL: "new-site-url",
  siteName: "site-name",
  siteDescription: "site-description",
  addButton: "add-button",
  editButton: "edit-button",
  deleteButton: "delete-button",
};

describe("Handler Tests", () => {
  const mockInteraction: any = {
    isButton: jest.fn(),
    customId: "",
    type: null,
    showModal: jest.fn(),
    reply: jest.fn(),
    guild: {
      id: "guild-id",
      channels: {
        create: jest.fn(),
        cache: {
          find: jest.fn(),
        },
        fetch: jest.fn(),
      },
    },
    client: {
      user: {
        id: "bot-id",
      },
    },
    fields: {
      getTextInputValue: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sitesConfig.length = 0; // Clear site config for each test
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("handleModals", () => {
    it("should handle add button interaction", async () => {
      mockInteraction.isButton = jest.fn(() => true); // Return true when checking for a button
      mockInteraction.customId = ids.addButton;

      // Mock the function to be spied upon
      const addSiteFormSpy = jest.spyOn(interactionModule, "addSiteForm");

      await handleModals(mockInteraction);

      // Check that the addSiteForm function was called with mockInteraction
      expect(addSiteFormSpy).toHaveBeenCalledWith(mockInteraction);
    });

    it("should handle edit button interaction", async () => {
      mockInteraction.isButton = jest.fn(() => true);
      mockInteraction.customId = ids.editButton;

      const editSiteFormSpy = jest.spyOn(interactionModule, "editSiteForm");

      await handleModals(mockInteraction);

      // Check that editSiteForm was called with the correct interaction
      expect(editSiteFormSpy).toHaveBeenCalledWith(mockInteraction);
    });

    it("should handle delete button interaction", async () => {
      mockInteraction.isButton = jest.fn(() => true);
      mockInteraction.customId = ids.deleteButton;

      const deleteSiteFormSpy = jest.spyOn(interactionModule, "deleteSiteForm");

      await handleModals(mockInteraction);

      // Verify that deleteSiteForm was called with the mock interaction
      expect(deleteSiteFormSpy).toHaveBeenCalledWith(mockInteraction);
    });

    it("should ignore non-button interactions", async () => {
      mockInteraction.isButton = jest.fn(() => false);

      await handleModals(mockInteraction);

      expect(mockInteraction.showModal).not.toHaveBeenCalled();
    });
  });

  describe("handleSubmissions", () => {
    it("should handle add site modal submission", async () => {
      // Mock the interaction type and customId
      mockInteraction.type = InteractionType.ModalSubmit;
      mockInteraction.customId = ids.addSiteModal;

      // Mock getTextInputValue to return a valid string (URL)
      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === ids.siteURL) return "https://example.com";
          if (id === ids.siteName) return "Example Site";
          if (id === ids.siteDescription) return "Description of the site";
          return "";
        }
      );

      // Mock guild.channels.create to return a mock channel object
      const mockChannel = { id: "mock-channel-id" };
      mockInteraction.guild.channels.create.mockResolvedValue(mockChannel);

      // Spy on the addSiteSubmission function
      const addSiteSubmissionSpy = jest.spyOn(
        interactionModule,
        "addSiteSubmission"
      );

      // Call handleSubmissions with the mocked interaction
      await handleSubmissions(mockInteraction);

      // Verify that addSiteSubmission was called with the mock interaction
      expect(addSiteSubmissionSpy).toHaveBeenCalledWith(mockInteraction);

      // Ensure that the guild.channels.create method was called with the correct arguments
      expect(mockInteraction.guild.channels.create).toHaveBeenCalledWith({
        name: "example-site", // The site name should be formatted
        type: ChannelType.GuildText,
        topic: "Description of the site",
        permissionOverwrites: expect.arrayContaining([
          expect.objectContaining({
            id: "guild-id", // @everyone
          }),
          expect.objectContaining({
            id: "bot-id", // Bot
          }),
        ]),
      });
    });

    it("should handle edit site modal submission", async () => {
      mockInteraction.type = InteractionType.ModalSubmit;
      mockInteraction.customId = ids.editSiteModal;
      const editSiteSubmissionSpy = jest.spyOn(
        interactionModule,
        "editSiteSubmission"
      );

      await handleSubmissions(mockInteraction);

      expect(editSiteSubmissionSpy).toHaveBeenCalledWith(mockInteraction);
    });

    it("should handle delete site modal submission", async () => {
      mockInteraction.type = InteractionType.ModalSubmit;
      mockInteraction.customId = ids.deleteSiteModal;

      const deleteSiteSubmissionSpy = jest.spyOn(
        interactionModule,
        "deleteSiteSubmission"
      );

      await handleSubmissions(mockInteraction);

      expect(deleteSiteSubmissionSpy).toHaveBeenCalledWith(mockInteraction);
    });

    it("should ignore non-modal interactions", async () => {
      mockInteraction.type = InteractionType.ApplicationCommand;

      await handleSubmissions(mockInteraction);

      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });
  });

  describe("Form Functions", () => {
    it("should display the add site modal", async () => {
      mockInteraction.isButton.mockReturnValue(true);

      await addSiteForm(mockInteraction);

      expect(mockInteraction.showModal).toHaveBeenCalled();
    });

    it("should display the edit site modal", async () => {
      mockInteraction.isButton.mockReturnValue(true);

      await editSiteForm(mockInteraction);

      expect(mockInteraction.showModal).toHaveBeenCalled();
    });

    it("should display the delete site modal", async () => {
      mockInteraction.isButton.mockReturnValue(true);

      await deleteSiteForm(mockInteraction);

      expect(mockInteraction.showModal).toHaveBeenCalled();
    });
  });

  describe("Submission Functions", () => {
    it("should add a site and create a channel", async () => {
      mockInteraction.type = InteractionType.ModalSubmit;
      mockInteraction.fields.getTextInputValue
        .mockReturnValueOnce("https://example.com") // URL
        .mockReturnValueOnce("Example Site") // Name
        .mockReturnValueOnce("Description"); // Description

      const mockChannel = { id: "channel-id" };
      mockInteraction.guild.channels.create.mockResolvedValue(mockChannel);

      await addSiteSubmission(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining("Example Site"),
          ephemeral: true,
        })
      );
    });

    it("should edit a site configuration", async () => {
      sitesConfig.push({
        url: "https://example.com",
        name: "Old Site",
        description: "Old Description",
        channelID: "channel-id",
      });

      mockInteraction.fields.getTextInputValue
        .mockReturnValueOnce("https://example.com") // Old URL
        .mockReturnValueOnce("https://newexample.com") // New URL
        .mockReturnValueOnce("New Site") // Name
        .mockReturnValueOnce("New Description"); // Description

      await editSiteSubmission(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining("New Site"),
          ephemeral: true,
        })
      );
    });

    it("should delete a site and its channel", async () => {
      sitesConfig.push({
        url: "https://example.com",
        name: "Example Site",
        description: "Description",
        channelID: "channel-id",
      });

      const mockChannel = { delete: jest.fn() };
      mockInteraction.guild.channels.fetch.mockResolvedValue(mockChannel);

      mockInteraction.fields.getTextInputValue.mockReturnValue(
        "https://example.com"
      );

      await deleteSiteSubmission(mockInteraction);

      expect(mockChannel.delete).toHaveBeenCalled();
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining("Example Site"),
          ephemeral: true,
        })
      );
    });
  });
});
