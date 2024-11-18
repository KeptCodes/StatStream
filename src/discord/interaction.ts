import {
  ActionRowBuilder,
  CacheType,
  ChannelType,
  Interaction,
  InteractionType,
  ModalBuilder,
  PermissionsBitField,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { channels, ids } from "../lib/constants";
import { sitesConfig } from "../lib/sitesConfig";
import logger from "../lib/logger";

export async function handleModals(interaction: Interaction<CacheType>) {
  if (!interaction.isButton()) return;

  if (interaction.customId === ids.addButton) {
    await addSiteForm(interaction);
  }
  if (interaction.customId === ids.editButton) {
    await editSiteForm(interaction);
  }
  if (interaction.customId === ids.deleteButton) {
    await deleteSiteForm(interaction);
  }
}

export async function handleSubmissions(interaction: Interaction<CacheType>) {
  if (interaction.type != InteractionType.ModalSubmit) return;
  if (interaction.customId === ids.addSiteModal) {
    await addSiteSubmission(interaction);
  }
  if (interaction.customId === ids.editSiteModal) {
    await editSiteSubmission(interaction);
  }
  if (interaction.customId === ids.deleteSiteModal) {
    await deleteSiteSubmission(interaction);
  }
}

export async function addSiteForm(interaction: Interaction<CacheType>) {
  if (!interaction.isButton()) return;
  const modal = new ModalBuilder()
    .setCustomId(ids.addSiteModal)
    .setTitle("Add New Site");

  // Text input for site URL
  const urlInput = new TextInputBuilder()
    .setCustomId(ids.siteURL)
    .setLabel("Site URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("https://example.com")
    .setRequired(true);

  // Text input for site name
  const nameInput = new TextInputBuilder()
    .setCustomId(ids.siteName)
    .setLabel("Site Name")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Example Site")
    .setRequired(true);

  // Text input for description (optional)
  const descriptionInput = new TextInputBuilder()
    .setCustomId(ids.siteDescription)
    .setLabel("Description (Optional)")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Enter a brief description of the site")
    .setRequired(false);

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(urlInput);
  const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
    nameInput
  );
  const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(
    descriptionInput
  );

  modal.addComponents(row1, row2, row3);

  await interaction.showModal(modal);
}

export async function editSiteForm(interaction: Interaction<CacheType>) {
  if (!interaction.isButton()) return;
  const modal = new ModalBuilder()
    .setCustomId(ids.editSiteModal)
    .setTitle("Edit Site Configuration");

  // Text input for the old URL
  const oldUrlInput = new TextInputBuilder()
    .setCustomId(ids.oldSiteURL)
    .setLabel("Current Site URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter current site URL")
    .setRequired(true);

  // Text input for the new URL
  const newUrlInput = new TextInputBuilder()
    .setCustomId(ids.newSiteURL)
    .setLabel("New Site URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter new site URL")
    .setRequired(true);

  // Text input for new name and description
  const nameInput = new TextInputBuilder()
    .setCustomId(ids.siteName)
    .setLabel("Site Name")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Example Site")
    .setRequired(false);

  const descriptionInput = new TextInputBuilder()
    .setCustomId(ids.siteDescription)
    .setLabel("Site Description")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Enter a brief description")
    .setRequired(false);

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
    oldUrlInput
  );
  const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
    newUrlInput
  );
  const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(
    nameInput
  );
  const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(
    descriptionInput
  );

  modal.addComponents(row1, row2, row3, row4);

  await interaction.showModal(modal);
}

export async function deleteSiteForm(interaction: Interaction<CacheType>) {
  if (!interaction.isButton()) return;
  const modal = new ModalBuilder()
    .setCustomId(ids.deleteSiteModal)
    .setTitle("Delete Site");

  // Text input for site URL to delete
  const urlInput = new TextInputBuilder()
    .setCustomId(ids.siteURL)
    .setLabel("Site URL to Delete")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("https://example.com")
    .setRequired(true);

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(urlInput);

  modal.addComponents(row1);

  await interaction.showModal(modal);
}

export async function addSiteSubmission(interaction: Interaction<CacheType>) {
  if (interaction.type != InteractionType.ModalSubmit) return;

  const url = interaction.fields
    .getTextInputValue(ids.siteURL)
    .replace(/\/$/, "");
  const name = interaction.fields.getTextInputValue(ids.siteName);
  const description = interaction.fields.getTextInputValue(ids.siteDescription);
  const guild = interaction.guild!;

  // Check if a channel for the site already exists
  if (sitesConfig.some((site) => site.url === url)) {
    return interaction.reply({
      content: "A site with this URL is already being tracked.",
      ephemeral: true,
    });
  }

  // Create a new channel for the site
  const channel = await guild.channels.create({
    name: name.replace(/\s+/g, "-").toLowerCase(),
    type: ChannelType.GuildText,
    topic: description || `Tracking analytics for ${name}`,
    permissionOverwrites: [
      {
        id: guild.id, // @everyone
        deny: [
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ViewChannel,
        ],
      },
      {
        id: interaction.client.user.id, // Bot
        allow: [
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ViewChannel,
        ],
      },
    ],
  });

  // Add the site to in-memory config
  const site = {
    url,
    name,
    description: description || null,
    channelID: channel.id,
  };
  sitesConfig.push(site);
  // Save the configuration to the "config" channel
  const configChannel = guild.channels.cache.find(
    (ch) => ch.name === channels.CONFIG
  );
  if (configChannel && configChannel.type == ChannelType.GuildText) {
    try {
      await configChannel.send(
        `\`\`\`json\n${JSON.stringify(site, null, 2)}\n\`\`\``
      );
      logger.warn(`Saved site configuration for: ${site.name}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while handling modals";
      logger.error("Error saving site configuration:", { error: errorMessage });
    }
  }
  await interaction.reply({
    content: `Site "${name}" added successfully and a channel has been created: <#${channel.id}>`,
    ephemeral: true,
  });
}

export async function editSiteSubmission(interaction: Interaction<CacheType>) {
  if (interaction.type != InteractionType.ModalSubmit) return;
  const oldUrl = interaction.fields.getTextInputValue(ids.oldSiteURL);
  const newUrl = interaction.fields
    .getTextInputValue(ids.newSiteURL)
    .replace(/\/$/, "");
  const name = interaction.fields.getTextInputValue(ids.siteName);
  const description = interaction.fields.getTextInputValue(ids.siteDescription);

  const siteIndex = sitesConfig.findIndex((site) => site.url === oldUrl);

  if (siteIndex === -1) {
    return interaction.reply({
      content: "Site with the provided URL not found.",
      ephemeral: true,
    });
  }

  sitesConfig[siteIndex].url = newUrl;
  if (name) {
    sitesConfig[siteIndex].name = name;
  }
  if (description) {
    sitesConfig[siteIndex].description = description;
  }

  const guild = interaction.guild!;
  const configChannel = guild.channels.cache.find(
    (ch) => ch.name === channels.CONFIG
  ) as TextChannel;

  if (configChannel) {
    const messages = await configChannel.messages.fetch({ limit: 100 });
    const configMessage = messages.find((msg) =>
      msg.content.includes(`"${oldUrl}"`)
    );
    if (configMessage) {
      await configMessage.edit(
        `\`\`\`json\n${JSON.stringify(sitesConfig[siteIndex], null, 2)}\n\`\`\``
      );
      await interaction.reply({
        content: `Site configuration for "${sitesConfig[siteIndex].name}" has been updated.`,
        ephemeral: true,
      });
    }
  }

  await interaction.reply({
    content: `Site "${name}" updated successfully.`,
    ephemeral: true,
  });
}

export async function deleteSiteSubmission(
  interaction: Interaction<CacheType>
) {
  if (interaction.type != InteractionType.ModalSubmit) return;
  const urlToDelete = interaction.fields
    .getTextInputValue(ids.siteURL)
    .replace(/\/$/, "");

  const siteIndex = sitesConfig.findIndex((site) => site.url === urlToDelete);

  if (siteIndex === -1) {
    return interaction.reply({
      content: "Site with this URL not found.",
      ephemeral: true,
    });
  }

  // Get the site and remove it from the in-memory config
  const site = sitesConfig.splice(siteIndex, 1)[0];

  const guild = interaction.guild!;
  // Delete the channel for the site
  try {
    const channel = await guild.channels.fetch(site.channelID);
    if (channel) {
      await channel.delete();
      logger.warn(`Deleted channel for site: ${site.name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while handling modals";
    logger.error("Error deleting channel:", { error: errorMessage });
  }

  const configChannel = guild.channels.cache.find(
    (ch) => ch.name === channels.CONFIG
  ) as TextChannel;

  if (configChannel) {
    // Find the message that contains the site config and delete it
    const messages = await configChannel.messages.fetch({ limit: 100 });
    const siteMessage = messages.find((message) =>
      message.content.includes(site.url)
    );

    if (siteMessage) {
      await siteMessage.delete();
      logger.warn(`Deleted site config for: ${site.name}`);
    }
  }

  // Inform the user of the successful deletion
  await interaction.reply({
    content: `Site "${site.name}" and its associated channel have been deleted successfully.`,
    ephemeral: true,
  });
}
