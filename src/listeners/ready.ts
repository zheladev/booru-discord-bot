import { Commands } from "../commands";
import { Client } from "discord.js";

export default (client: Client): void => {
    console.log('Starting up client...')
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        await client.application.commands.set(Commands);

        console.log(`${client.user.username} is online`);
    });
};