import {
  ChannelType,
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  PermissionsBitField,
} from "discord.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "statstream");
  next();
});

// In-memory storage for site configurations
const sitesConfig = [];

// Function to find or create a "config" channel
async function setupConfigChannel() {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);

  // Check if "config" channel exists
  let configChannel = guild.channels.cache.find((ch) => ch.name === "config");

  if (!configChannel) {
    // Create "config" channel
    configChannel = await guild.channels.create({
      name: "config",
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

// Function to save a site's configuration to the "config" channel
async function saveSiteConfig(configChannel, site) {
  try {
    await configChannel.send(
      `\`\`\`json\n${JSON.stringify(site, null, 2)}\n\`\`\``
    );
    console.log(`Saved site configuration for: ${site.name}`);
  } catch (error) {
    console.error("Error saving site configuration:", error);
  }
}

// Function to rebuild site configurations from the "config" channel
async function rebuildSitesConfig() {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
  const configChannel = guild.channels.cache.find((ch) => ch.name === "config");

  if (!configChannel) {
    console.warn('The "config" channel does not exist.');
    return;
  }

  // Fetch message history from the "config" channel
  const messages = await configChannel.messages.fetch({ limit: 100 });
  sitesConfig.length = 0; // Clear existing in-memory config

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

// Function to find or create an "Add Sites" channel
async function setupAddSitesChannel() {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);

  // Check if "add-sites" channel exists
  let addSitesChannel = guild.channels.cache.find(
    (ch) => ch.name === "add-sites"
  );

  if (!addSitesChannel) {
    // Create "add-sites" channel
    addSitesChannel = await guild.channels.create({
      name: "add-sites",
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
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("add-site")
      .setLabel("Add New Site")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("edit-site")
      .setLabel("Edit Existing Site")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("delete-site")
      .setLabel("Delete Site")
      .setStyle(ButtonStyle.Danger)
  );

  await addSitesChannel.send({
    content:
      "Click a button below to add, edit, or delete a site for analytics tracking.",
    components: [row],
  });
}

// Function to handle adding a site via modal
async function handleAddSite(interaction) {
  const modal = new ModalBuilder()
    .setCustomId("add-site-modal")
    .setTitle("Add New Site");

  // Text input for site URL
  const urlInput = new TextInputBuilder()
    .setCustomId("site-url")
    .setLabel("Site URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("https://example.com")
    .setRequired(true);

  // Text input for site name
  const nameInput = new TextInputBuilder()
    .setCustomId("site-name")
    .setLabel("Site Name")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Example Site")
    .setRequired(true);

  // Text input for description (optional)
  const descriptionInput = new TextInputBuilder()
    .setCustomId("site-description")
    .setLabel("Description (Optional)")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Enter a brief description of the site")
    .setRequired(false);

  const row1 = new ActionRowBuilder().addComponents(urlInput);
  const row2 = new ActionRowBuilder().addComponents(nameInput);
  const row3 = new ActionRowBuilder().addComponents(descriptionInput);

  modal.addComponents(row1, row2, row3);

  await interaction.showModal(modal);
}

// Function to process modal submission
async function handleModalSubmission(interaction) {
  const url = interaction.fields
    .getTextInputValue("site-url")
    .replace(/\/$/, "");
  const name = interaction.fields.getTextInputValue("site-name");
  const description = interaction.fields.getTextInputValue("site-description");

  const guild = interaction.guild;

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
        id: client.user.id, // Bot
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
  const configChannel = guild.channels.cache.find((ch) => ch.name === "config");
  if (configChannel) {
    await saveSiteConfig(configChannel, site);
  }
  await interaction.reply({
    content: `Site "${name}" added successfully and a channel has been created: <#${channel.id}>`,
    ephemeral: true,
  });
}

async function handleEditSite(interaction) {
  const modal = new ModalBuilder()
    .setCustomId("edit-site-modal")
    .setTitle("Edit Site Configuration");

  // Text input for the old URL
  const oldUrlInput = new TextInputBuilder()
    .setCustomId("old-site-url")
    .setLabel("Current Site URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter current site URL")
    .setRequired(true);

  // Text input for the new URL
  const newUrlInput = new TextInputBuilder()
    .setCustomId("new-site-url")
    .setLabel("New Site URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter new site URL")
    .setRequired(true);

  // Text input for new name and description
  const nameInput = new TextInputBuilder()
    .setCustomId("site-name")
    .setLabel("Site Name")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Example Site")
    .setRequired(false);

  const descriptionInput = new TextInputBuilder()
    .setCustomId("site-description")
    .setLabel("Site Description")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Enter a brief description")
    .setRequired(false);

  const row1 = new ActionRowBuilder().addComponents(oldUrlInput);
  const row2 = new ActionRowBuilder().addComponents(newUrlInput);
  const row3 = new ActionRowBuilder().addComponents(nameInput);
  const row4 = new ActionRowBuilder().addComponents(descriptionInput);

  modal.addComponents(row1, row2, row3, row4);

  await interaction.showModal(modal);
}

// Function to process editing modal submission
async function handleEditModalSubmission(interaction) {
  const oldUrl = interaction.fields.getTextInputValue("old-site-url");
  const newUrl = interaction.fields
    .getTextInputValue("new-site-url")
    .replace(/\/$/, "");
  const name = interaction.fields.getTextInputValue("site-name");
  const description = interaction.fields.getTextInputValue("site-description");

  const siteIndex = sitesConfig.findIndex((site) => site.url === oldUrl);

  if (siteIndex === -1) {
    return interaction.reply({
      content: "Site with the provided URL not found.",
      ephemeral: true,
    });
  }

  // Update the site data
  sitesConfig[siteIndex].url = newUrl;
  if (name) {
    sitesConfig[siteIndex].name = name;
  }
  sitesConfig[siteIndex].description = description;

  const guild = interaction.guild;
  const configChannel = guild.channels.cache.find((ch) => ch.name === "config");

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

async function handleDeleteSite(interaction) {
  const modal = new ModalBuilder()
    .setCustomId("delete-site-modal")
    .setTitle("Delete Site");

  // Text input for site URL to delete
  const urlInput = new TextInputBuilder()
    .setCustomId("site-url")
    .setLabel("Site URL to Delete")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("https://example.com")
    .setRequired(true);

  const row1 = new ActionRowBuilder().addComponents(urlInput);

  modal.addComponents(row1);

  await interaction.showModal(modal);
}

async function handleDeleteSiteSubmission(interaction) {
  const urlToDelete = interaction.fields
    .getTextInputValue("site-url")
    .replace(/\/$/, ""); // Remove trailing slash if any

  // Find the site to delete by URL
  const siteIndex = sitesConfig.findIndex((site) => site.url === urlToDelete);

  if (siteIndex === -1) {
    return interaction.reply({
      content: "Site with this URL not found.",
      ephemeral: true,
    });
  }

  // Get the site and remove it from the in-memory config
  const site = sitesConfig.splice(siteIndex, 1)[0]; // Remove the site from the array

  // Delete the channel for the site
  try {
    const guild = interaction.guild;
    const channel = await guild.channels.fetch(site.channelID);
    if (channel) {
      await channel.delete(); // Delete the site channel
      console.log(`Deleted channel for site: ${site.name}`);
    }
  } catch (error) {
    console.error("Error deleting channel:", error);
  }

  // Remove the site from the "config" channel
  const guild = interaction.guild;
  const configChannel = guild.channels.cache.find((ch) => ch.name === "config");

  if (configChannel) {
    // Find the message that contains the site config and delete it
    const messages = await configChannel.messages.fetch({ limit: 100 });
    const siteMessage = messages.find((message) =>
      message.content.includes(site.url)
    );

    if (siteMessage) {
      await siteMessage.delete();
      console.log(`Deleted site config for: ${site.name}`);
    }
  }

  // Inform the user of the successful deletion
  await interaction.reply({
    content: `Site "${site.name}" and its associated channel have been deleted successfully.`,
    ephemeral: true,
  });
}

// Discord interaction handling
client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "add-site") {
      await handleAddSite(interaction); // Handle "Add New Site"
    } else if (interaction.customId === "edit-site") {
      await handleEditSite(interaction); // Handle "Edit Existing Site"
    } else if (interaction.customId === "delete-site") {
      await handleDeleteSite(interaction); // Handle "Delete Site"
    }
  } else if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === "add-site-modal"
  ) {
    await handleModalSubmission(interaction); // Handle modal for adding site
  } else if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === "edit-site-modal"
  ) {
    await handleEditModalSubmission(interaction); // Handle modal for editing site
  } else if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === "delete-site-modal"
  ) {
    await handleDeleteSiteSubmission(interaction); // Handle modal for deleting site
  }
});

// Discord bot login and setup "add-sites" channel
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // Set up channels
  await setupAddSitesChannel();
  const configChannel = await setupConfigChannel();

  // Rebuild site configurations
  await rebuildSitesConfig();
});

client.login(process.env.DISCORD_TOKEN);

// Endpoint to handle analytics data
app.post("/track", async (req, res) => {
  const { eventType, page, referrer, timestamp, sessionId, deviceInfo, url } =
    req.body;
  const clientIP = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")[0].trim()
    : req.socket.remoteAddress;
  // Fetch location info using IP (using ip-api.com here for simplicity)
  let locationData = {};
  try {
    const locationResponse = await axios.get(
      `http://ip-api.com/json/${clientIP}`
    );
    locationData = {
      ip: clientIP,
      city: locationResponse.data.city,
      country: locationResponse.data.country,
      region: locationResponse.data.regionName,
      lat: locationResponse.data.lat,
      lon: locationResponse.data.lon,
    };
  } catch (error) {
    console.error("Error fetching location data:", error);
    locationData = { ip: clientIP, city: "Unknown", country: "Unknown" };
  }
  // Find the site configuration based on URL
  const site = sitesConfig.find((site) => site.url === url);
  if (!site) {
    return res.status(400).send("Site not found");
  }
  const messageData = {
    event: eventType,
    page: page,
    referrer: referrer,
    timestamp: timestamp,
    session_id: sessionId,
    device_info: `${deviceInfo.platform}, ${deviceInfo.userAgent}`,
    location: locationData,
  };

  // Send the message to the specific channel for the site
  try {
    const channel = await client.channels.fetch(site.channelID);
    if (channel) {
      await channel.send(
        `\`\`\`json\n${JSON.stringify(messageData, null, 2)}\n\`\`\``
      );
      res.status(200).send("Event tracked successfully");
    } else {
      res.status(500).send("Channel not found");
    }
  } catch (error) {
    console.error("Error sending message to Discord:", error);
    res.status(500).send("Error tracking event");
  }
});

// Endpoint to fetch analytics data for the dashboard
app.get("/analytics", async (req, res) => {
  try {
    const dashboardData = {};

    // Loop through each site in the configuration
    for (const site of sitesConfig) {
      const channel = await client.channels.fetch(site.channelID);
      if (!channel) {
        console.error(`Channel not found for site: ${site.name}`);
        continue;
      }

      // Fetch the last 10 messages from the channel as sample data
      const messages = await channel.messages.fetch({ limit: 10 });
      const siteData = [];

      messages.forEach((message) => {
        // Here, parse the message content into structured data
        const jsonData = JSON.parse(
          message.content.replace(/```json|```/g, "").trim()
        );
        siteData.push(jsonData);
      });

      // Store the parsed data for each site
      dashboardData[site.name] = siteData;
    }

    // Send the collected analytics data
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// Express server to receive tracking data
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Analytics tracking server running on port ${PORT}`);
});
