import { ChannelType, Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import cors from 'cors';
import axios from 'axios';


dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const app = express();
app.use(cors())
app.use(express.json());

// Read sites configuration from JSON file
const sitesFilePath = './sites.json';
let sitesConfig = JSON.parse(fs.readFileSync(sitesFilePath, 'utf-8'));

// Helper function to update JSON file when new channels are created
function updateSitesConfig() {
  fs.writeFileSync(sitesFilePath, JSON.stringify(sitesConfig, null, 2));
}

// Function to find or create a channel for each site
async function setupChannels() {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);


  for (const site of sitesConfig) {
    if (!site.channelID) {
      // Create a new channel with the site name
      const channel = await guild.channels.create({
        name: site.name.replace(/\s+/g, '-').toLowerCase(),
        type: ChannelType.GuildText,
        topic: site.description,
      });
      console.log(`Created new channel for ${site.name}: ${channel.id}`);

      // Update the site's channelID in the JSON file and save
      site.channelID = channel.id;
      updateSitesConfig();
    }
  }
}

// Discord bot login and setup channels
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setupChannels().catch(console.error);
});

client.login(process.env.DISCORD_TOKEN);



// Endpoint to handle analytics data
app.post('/track', async (req, res) => {
  const {  eventType, page, referrer, timestamp, sessionId, deviceInfo, url } = req.body;
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Fetch location info using IP (using ip-api.com here for simplicity)
  let locationData = {};
  try {
    const locationResponse = await axios.get(`http://ip-api.com/json/${clientIP}`);
    locationData = {
      ip: clientIP,
      city: locationResponse.data.city,
      country: locationResponse.data.country,
      region: locationResponse.data.regionName,
      lat: locationResponse.data.lat,
      lon: locationResponse.data.lon
    };
  } catch (error) {
    console.error("Error fetching location data:", error);
    locationData = { ip: clientIP, city: "Unknown", country: "Unknown" };
  }
  // Find the site configuration based on URL
  const site = sitesConfig.find(site => site.url === url);
  if (!site) {
    return res.status(400).send('Site not found');
  }
  const messageData = {
    event: eventType,
    page: page,
    referrer: referrer,
    timestamp: timestamp,
    session_id: sessionId,
    device_info: `${deviceInfo.platform}, ${deviceInfo.userAgent}`,
    location: locationData
  };

  // Send the message to the specific channel for the site
  try {
    const channel = await client.channels.fetch(site.channelID);
    if (channel) {
      await channel.send(`\`\`\`json\n${JSON.stringify(messageData, null, 2)}\n\`\`\``);
      res.status(200).send('Event tracked successfully');
    } else {
      res.status(500).send('Channel not found');
    }
  } catch (error) {
    console.error("Error sending message to Discord:", error);
    res.status(500).send('Error tracking event');
  }
});

// Endpoint to fetch analytics data for the dashboard
app.get('/analytics', async (req, res) => {
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
        const jsonData = JSON.parse(message.content.replace(/```json|```/g, '').trim());
          siteData.push(jsonData);
      });

      // Store the parsed data for each site
      dashboardData[site.name] = siteData;
    }

    // Send the collected analytics data
    res.status(200).json(dashboardData);

  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Express server to receive tracking data
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Analytics tracking server running on port ${PORT}`);
});
