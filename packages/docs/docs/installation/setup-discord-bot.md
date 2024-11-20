---
sidebar_position: 2
---

# Setup Discord Bot

To send analytics data from StatStream to your Discord server, you need to create and configure a **Discord bot**. Here’s how you can do that:

### 1. **Create a New Bot**:

- Go to the [Discord Developer Portal](https://discord.com/developers/applications).
- Click on **New Application** and give it a name (e.g., StatStream Bot).
- In the left-hand menu, navigate to the **Bot** section and click **Add Bot**.
- After the bot is created, you will be able to manage its settings.

### 2. **Get the Bot Token**:

- In the **Bot** section, you will see a **Token**.
- **Copy the token** (you’ll need this to configure StatStream).

### 3. **Invite the Bot to Your Server**:

- Go to the **OAuth2** section in the Developer Portal.
- Under **OAuth2 URL Generator**, select **bot** under **Scopes** and select **Send Messages** under **Bot Permissions**.
- Copy the generated URL and open it in your browser to invite the bot to your Discord server.

### 4. **Add the Bot Token to StatStream Configuration**:

Once your bot is set up and invited to your server, use the **Bot Token** in the StatStream configuration to authenticate the bot and send data to your Discord server.

Add the following to your `.env` file in the StatStream project:

```
DISCORD_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-server-id
```

**Note**: Ensure that the bot has permission to send messages to the desired channel on your server.

### How to Get the Bot Token and Invite to Server

For a visual walkthrough, here’s a helpful video guide on setting up your bot:

<iframe width="560" height="315" src="https://www.youtube.com/embed/mbAfu8mHrFo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Once your bot is set up and the token is correctly configured, StatStream will start sending website activity updates to your Discord server.
