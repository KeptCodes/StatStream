// import { expect, it, describe, beforeEach, afterEach } from "@jest/globals";
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
import { mockConfigChannel } from "./mocks.test";

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
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("handleModals", () => {
    it("should handle add button interaction", async () => {
      mockInteraction.isButton = jest.fn(() => true); // Return true when checking for a button
      mockInteraction.customId = ids.addButton;

      const addSiteFormSpy = jest.spyOn(interactionModule, "addSiteForm");

      await handleModals(mockInteraction);

      expect(addSiteFormSpy).toHaveBeenCalledWith(mockInteraction);
    });

    it("should handle edit button interaction", async () => {
      mockInteraction.isButton = jest.fn(() => true);
      mockInteraction.customId = ids.editButton;

      const editSiteFormSpy = jest.spyOn(interactionModule, "editSiteForm");

      await handleModals(mockInteraction);

      expect(editSiteFormSpy).toHaveBeenCalledWith(mockInteraction);
    });

    it("should handle delete button interaction", async () => {
      mockInteraction.isButton = jest.fn(() => true);
      mockInteraction.customId = ids.deleteButton;

      const deleteSiteFormSpy = jest.spyOn(interactionModule, "deleteSiteForm");

      await handleModals(mockInteraction);

      expect(deleteSiteFormSpy).toHaveBeenCalledWith(mockInteraction);
    });

    it("should ignore non-button interactions", async () => {
      mockInteraction.isButton = jest.fn(() => false);

      await handleModals(mockInteraction);

      expect(mockInteraction.showModal).not.toHaveBeenCalled();
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

    // Additional test cases for edge cases
    it("should handle add site submission with deuplicate URL", async () => {
      sitesConfig.push({
        url: "https://example.com",
        name: "Example Site",
        description: "Description",
        channelID: "channel-id",
      });
      mockInteraction.type = InteractionType.ModalSubmit;
      mockInteraction.customId = ids.addSiteModal;
      mockInteraction.fields.getTextInputValue.mockReturnValueOnce(
        "https://example.com"
      );

      await addSiteSubmission(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "A site with this URL is already being tracked.",
          ephemeral: true,
        })
      );
    });

    it("should handle edit site submission with non-existent site", async () => {
      sitesConfig.push({
        url: "https://example.com",
        name: "Example Site",
        description: "Description",
        channelID: "channel-id",
      });

      mockInteraction.fields.getTextInputValue
        .mockReturnValueOnce("https://nonexistent.com") // Non-existent URL
        .mockReturnValueOnce("New Site") // New Name
        .mockReturnValueOnce("New Description"); // New Description

      await editSiteSubmission(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Site with the provided URL not found.",
          ephemeral: true,
        })
      );
    });
  });

  describe("handleSubmissions", () => {
    const site = {
      url: "https://example.com",
      name: "Example Site",
      description: "Description of the site",
      channelID: "mock-channel-id",
    };
    const updatedSite = {
      url: "https://new-example.com",
      name: "Updated Example Site",
      description: "Updated description",
    };

    const mockChannel = {
      id: "mock-channel-id",
      type: ChannelType.GuildText,
      send: jest.fn(),
      messages: {
        fetch: jest
          .fn()
          .mockResolvedValue([
            { content: `\`\`\`json\n${JSON.stringify(site)}\n\`\`\`` },
          ]), // Mock a found message
      },
    };

    it("should handle add site modal submission when the site is already being tracked", async () => {
      // Simulating an existing site with the same URL
      sitesConfig.push({
        url: site.url,
        name: site.name,
        description: site.description,
        channelID: "existing-channel-id",
      });

      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === "site-url") return site.url;
          if (id === "site-name") return site.name;
          if (id === "site-description") return site.description;
          return "";
        }
      );

      await addSiteSubmission(mockInteraction);

      // Check that the reply for duplicate URL is sent
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "A site with this URL is already being tracked.",
          ephemeral: true,
        })
      );

      // Ensure no channel is created or configuration sent
      expect(mockInteraction.guild.channels.create).not.toHaveBeenCalled();
      expect(mockConfigChannel.send).not.toHaveBeenCalled();
    });

    it("should handle add site modal submission when site is new", async () => {
      // Simulating no existing site with the same URL
      mockInteraction.guild.channels.create.mockResolvedValue(mockChannel);
      mockInteraction.guild.channels.cache.find.mockReturnValue(
        mockConfigChannel
      );

      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === "site-url") return site.url;
          if (id === "site-name") return site.name;
          if (id === "site-description") return site.description;
          return "";
        }
      );

      await addSiteSubmission(mockInteraction);

      // Verify that the site is added to the sitesConfig
      expect(sitesConfig).toContainEqual({
        url: site.url,
        name: site.name,
        description: site.description,
        channelID: mockChannel.id,
      });

      // Verify that the channel was created correctly
      expect(mockInteraction.guild.channels.create).toHaveBeenCalledWith({
        name: site.name.replace(/\s+/g, "-").toLowerCase(),
        type: ChannelType.GuildText,
        topic: site.description,
        permissionOverwrites: expect.arrayContaining([
          expect.objectContaining({ id: "guild-id" }),
          expect.objectContaining({ id: "bot-id" }),
        ]),
      });

      // Verify that the configuration was saved to the config channel
      expect(mockConfigChannel.send).toHaveBeenCalledWith(
        `\`\`\`json\n${JSON.stringify(
          {
            url: site.url,
            name: site.name,
            description: site.description,
            channelID: mockChannel.id,
          },
          null,
          2
        )}\n\`\`\``
      );

      // Verify the reply message for the successful site addition
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: `Site "Example Site" added successfully and a channel has been created: <#${mockChannel.id}>`,
          ephemeral: true,
        })
      );
    });

    it("should handle errors when saving site configuration to the config channel", async () => {
      // Simulating no existing site with the same URL
      mockInteraction.guild.channels.create.mockResolvedValue(mockChannel);
      mockInteraction.guild.channels.cache.find.mockReturnValue(
        mockConfigChannel
      );

      // Simulate an error in sending the configuration
      mockConfigChannel.send.mockRejectedValue(
        new Error("Failed to send message")
      );

      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === "site-url") return site.url;
          if (id === "site-name") return site.name;
          if (id === "site-description") return site.description;
          return "";
        }
      );

      await addSiteSubmission(mockInteraction);

      // Verify that the error is logged
      expect(console.error).toHaveBeenCalledWith(
        "Error saving site configuration:",
        expect.any(Error)
      );

      // Verify that the site is still added to sitesConfig
      expect(sitesConfig).toContainEqual({
        url: site.url,
        name: site.name,
        description: site.description,
        channelID: mockChannel.id,
      });

      // Verify that the channel was created and the reply sent
      expect(mockInteraction.guild.channels.create).toHaveBeenCalled();
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: `Site "Example Site" added successfully and a channel has been created: <#${mockChannel.id}>`,
          ephemeral: true,
        })
      );
    });

    it("should handle add site modal submission", async () => {
      // Mocking the Modal Submit interaction type
      mockInteraction.type = InteractionType.ModalSubmit;
      mockInteraction.customId = ids.addSiteModal;

      // Mocking the input values from the modal
      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === ids.siteURL) return "https://example.com"; // Valid URL
          if (id === ids.siteName) return "Example Site"; // Site Name
          if (id === ids.siteDescription) return "Description of the site"; // Site Description
          return "";
        }
      );

      // Mocking the channel creation with mock data
      const mockChannel = { id: "mock-channel-id" };
      mockInteraction.guild.channels.create.mockResolvedValue(mockChannel);

      // Spy on the addSiteSubmission function to ensure it was called
      const addSiteSubmissionSpy = jest.spyOn(
        interactionModule,
        "addSiteSubmission"
      );

      await handleSubmissions(mockInteraction);

      expect(addSiteSubmissionSpy).toHaveBeenCalledWith(mockInteraction);

      expect(mockInteraction.guild.channels.create).toHaveBeenCalledWith({
        name: "example-site",
        type: ChannelType.GuildText,
        topic: "Description of the site",
        permissionOverwrites: expect.arrayContaining([
          expect.objectContaining({
            id: "guild-id",
          }),
          expect.objectContaining({
            id: "bot-id",
          }),
        ]),
      });

      // Verify that the bot replies with an appropriate message
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining("Example Site"),
          ephemeral: true, // Ensure the reply is ephemeral (private)
        })
      );
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: `Site "Example Site" added successfully and a channel has been created: <#${mockChannel.id}>`,
          ephemeral: true,
        })
      );
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

    it("should handle edit site modal submission when site is found", async () => {
      sitesConfig[0] = site;
      // Mocking interaction fields
      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === "old-site-url") return site.url;
          if (id === "new-site-url") return updatedSite.url;
          if (id === "site-name") return updatedSite.name;
          if (id === "site-description") return updatedSite.description;
          return "";
        }
      );

      mockInteraction.guild.channels.cache.find.mockReturnValue(
        mockConfigChannel
      ); // Return mockConfigChannel when searching for the channel

      await editSiteSubmission(mockInteraction);

      // Verify the site configuration was updated
      expect(sitesConfig[0].url).toBe(updatedSite.url);
      expect(sitesConfig[0].name).toBe(updatedSite.name);
      expect(sitesConfig[0].description).toBe(updatedSite.description);

      // Verify that the edit message was sent to the config channel
      expect(mockConfigChannel.messages.fetch).toHaveBeenCalledWith({
        limit: 100,
      });
      const fetchedMessages = await mockConfigChannel.messages.fetch();

      expect(fetchedMessages.at(0)?.edit).toHaveBeenCalledWith(
        `\`\`\`json\n${JSON.stringify(sitesConfig[0], null, 2)}\n\`\`\``
      );

      // Verify that the interaction reply is correct
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: `Site configuration for "${updatedSite.name}" has been updated.`,
          ephemeral: true,
        })
      );
    });

    it("should handle edit site modal submission when site is not found", async () => {
      // Simulate that the site with the old URL does not exist
      sitesConfig.length = 0; // Clear existing site
      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === "old-site-url") return site.url;
          if (id === "new-site-url") return updatedSite.url;
          if (id === "site-name") return updatedSite.name;
          if (id === "site-description") return updatedSite.description;
          return "";
        }
      );

      await editSiteSubmission(mockInteraction);

      // Verify that the interaction sends an error message
      expect(mockInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Site with the provided URL not found.",
          ephemeral: true,
        })
      );

      // Ensure no channel edit occurred
      expect(mockConfigChannel.messages.fetch).not.toHaveBeenCalled();
    });

    it("should handle edit site modal submission when site is not found", async () => {
      mockConfigChannel.type = 2; // Not ChannelType.GuildText

      // Simulate that the site with the old URL does not exist
      sitesConfig.length = 0; // Clear existing site
      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === "old-site-url") return site.url;
          if (id === "new-site-url") return updatedSite.url;
          if (id === "site-name") return updatedSite.name;
          if (id === "site-description") return updatedSite.description;
          return "";
        }
      );

      await editSiteSubmission(mockInteraction);

      // Verify that messages.fetch was not called because the channel type is not GuildText
      expect(mockConfigChannel.messages.fetch).not.toHaveBeenCalled();
    });

    it("should handle delete site modal submission", async () => {
      // Mocking the interaction type and ID
      mockInteraction.type = InteractionType.ModalSubmit;
      mockInteraction.customId = ids.deleteSiteModal;

      // Mock the URL to delete and other fields
      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === ids.siteURL) return "https://example.com"; // Site URL to delete
          return "";
        }
      );

      // Mocking the site configuration array
      const siteToDelete = {
        url: "https://example.com",
        name: "Example Site",
        description: "A sample site",
        channelID: "mock-channel-id",
      };
      sitesConfig.push(siteToDelete); // Add the site to the in-memory config

      // Mock the channel deletion
      const mockChannel = { id: "mock-channel-id", delete: jest.fn() };
      mockInteraction.guild.channels.fetch.mockResolvedValue(mockChannel);
      mockInteraction.guild.channels.cache.find.mockReturnValue(
        mockConfigChannel
      );

      // Spy on the deleteSiteSubmission function
      const deleteSiteSubmissionSpy = jest.spyOn(
        interactionModule,
        "deleteSiteSubmission"
      );

      // Call the function
      await handleSubmissions(mockInteraction);

      // Verify the deleteSiteSubmission function is called
      expect(deleteSiteSubmissionSpy).toHaveBeenCalledWith(mockInteraction);

      // Verify that the channel deletion was called
      expect(mockChannel.delete).toHaveBeenCalled();

      // Verify that the config message deletion was called
      expect(mockConfigChannel.messages.fetch).toHaveBeenCalled();
      expect(mockConfigChannel.messages.fetch).toHaveBeenCalledWith({
        limit: 100,
      });

      const fetchedMessages = await mockConfigChannel.messages.fetch();
      expect(fetchedMessages[0].delete).toHaveBeenCalled();

      // Ensure that the interaction reply is called with success message
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `Site "${siteToDelete.name}" and its associated channel have been deleted successfully.`,
        ephemeral: true,
      });
    });

    it("should handle site not found during delete site modal submission", async () => {
      // Mocking the interaction type and ID
      mockInteraction.type = InteractionType.ModalSubmit;
      mockInteraction.customId = ids.deleteSiteModal;

      // Mock the URL to delete and other fields
      mockInteraction.fields.getTextInputValue.mockImplementation(
        (id: string) => {
          if (id === ids.siteURL) return "https://nonexistent.com"; // Site URL that does not exist
          return "";
        }
      );

      // Make sure the site does not exist in the configuration
      const deleteSiteSubmissionSpy = jest.spyOn(
        interactionModule,
        "deleteSiteSubmission"
      );

      // Call the function
      await handleSubmissions(mockInteraction);

      // Verify the deleteSiteSubmission function is called
      expect(deleteSiteSubmissionSpy).toHaveBeenCalledWith(mockInteraction);

      // Ensure that the reply is sent with an error message
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "Site with this URL not found.",
        ephemeral: true,
      });

      // Verify that no deletion happens
      expect(mockInteraction.guild.channels.fetch).not.toHaveBeenCalled();
      expect(
        mockInteraction.guild.channels.cache.find().messages.fetch
      ).not.toHaveBeenCalled();
    });

    it("should ignore non-modal interactions", async () => {
      mockInteraction.type = InteractionType.ApplicationCommand;

      await handleSubmissions(mockInteraction);

      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });
  });
});
