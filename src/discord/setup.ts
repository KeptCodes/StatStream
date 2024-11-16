import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  PermissionsBitField,
} from "discord.js";
import env from "../lib/env";
import { channels, ids } from "../lib/constants";
import { sitesConfig } from "../lib/sitesConfig";

export async function setupConfigChannel(client: Client<true>) {
  const guild = await client.guilds.fetch(env.DISCORD_GUILD_ID);
  // Check if "config" channel exists
  let configChannel = guild.channels.cache.find(
    (ch) => ch.name === channels.CONFIG
  );

  if (!configChannel) {
    // Create "config" channel
    configChannel = await guild.channels.create({
      name: channels.CONFIG,
      type: ChannelType.GuildText,
      topic: "Configuration storage for site analytics. Do not edit manually.",
      permissionOverwrites: [
        {
          id: guild.id, // @everyone
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: client.user.id, // Bot
          allow: [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ViewChannel,
          ],
        },
      ],
    });
    console.log(`Created "config" channel: ${configChannel.id}`);
  } else {
    console.log(`"config" channel already exists: ${configChannel.id}`);
  }

  return configChannel;
}

// Function to find or create an "Add Sites" channel
export async function setupAddSitesChannel(client: Client<true>) {
  const guild = await client.guilds.fetch(env.DISCORD_GUILD_ID);

  // Check if "add-sites" channel exists
  let addSitesChannel = guild.channels.cache.find(
    (ch) => ch.name === channels.ADDSITES
  );

  if (!addSitesChannel) {
    // Create "add-sites" channel
    addSitesChannel = await guild.channels.create({
      name: channels.ADDSITES,
      type: ChannelType.GuildText,
      topic: "Use this channel to add new sites for analytics tracking.",
      permissionOverwrites: [
        {
          id: guild.id, // @everyone role
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: client.user.id, // Bot
          allow: [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ViewChannel,
          ],
        },
      ],
    });
    console.log(`Created "add-sites" channel: ${addSitesChannel.id}`);
  } else {
    console.log(`"add-sites" channel already exists: ${addSitesChannel.id}`);
  }

  // Post an interactive message with buttons
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

  if (addSitesChannel.type != ChannelType.GuildText) {
    return;
  }
  await addSitesChannel.send({
    content:
      "Click a button below to add, edit, or delete a site for analytics tracking.",
    components: [row],
  });
}

// Function to rebuild site configurations from the "config" channel
export async function rebuildSitesConfig(client: Client<true>) {
  const guild = await client.guilds.fetch(env.DISCORD_GUILD_ID);
  const configChannel = guild.channels.cache.find(
    (ch) => ch.name === channels.CONFIG
  );

  if (!configChannel) {
    console.warn('The "config" channel does not exist.');
    return;
  }
  if (configChannel.type != ChannelType.GuildText) {
    return;
  }

  const messages = await configChannel.messages.fetch({ limit: 100 });
  sitesConfig.length = 0;

  messages.forEach((message) => {
    try {
      const site = JSON.parse(
        message.content.replace(/```json|```/g, "").trim()
      );
      sitesConfig.push(site);
    } catch (error) {
      console.warn("Skipping invalid configuration message:", error);
    }
  });

  console.log("Rebuilt site configurations from config channel.");
}
