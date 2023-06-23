import { Client, IntentsBitField } from "discord.js";
import { config } from "dotenv";
import interactionCreate from "./listeners/interactionCreate";
import messageSent from "./listeners/messageSent";
import ready from "./listeners/ready";

async function main() {
  config();
  const client = new Client({
    intents: [
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.Guilds
    ]
  });
  ready(client);
  messageSent(client);
  interactionCreate(client);

  client.login(process.env.DISCORD_TOKEN);
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })