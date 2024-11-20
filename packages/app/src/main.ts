import { InteractionType, Events } from "discord.js";
import server from "./lib/server";
import client from "./lib/discord";
import env from "./lib/env";
import { handleModals, handleSubmissions } from "./discord/interaction";
import {
  rebuildSitesConfig,
  setupAddSitesChannel,
  setupConfigChannel,
} from "./discord/setup";

client.login(env.DISCORD_TOKEN);

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}!`);

  // Set up channels
  await setupAddSitesChannel(c);
  await setupConfigChannel(c);

  // Rebuild site configurations
  await rebuildSitesConfig(c);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton()) {
      await handleModals(interaction);
      return;
    } else if (interaction.type === InteractionType.ModalSubmit) {
      await handleSubmissions(interaction);
      return;
    }
  } catch (error) {
    console.log("Interaction Error:", error);
  }
});

const PORT = env.PORT;

server.listen(PORT, () => {
  console.log(`Analytics tracking server running on port ${PORT}`);
});
