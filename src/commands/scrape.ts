import { CommandInteraction, Client, ApplicationCommandType, GuildTextBasedChannel } from "discord.js";
import { getAllGuildMessages } from "../services/guild";
import { ICommand } from "../interfaces/ICommand";

export const Scrape: ICommand = {
    name: "scrape",
    description: "Scrapes server for all messages.",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const gid = interaction.guild.id;
        const dump = await (getAllGuildMessages(client, gid));

        const guildInfo = await client.guilds.fetch(gid);
        const guildRow = {
            id: BigInt(gid),
            name: guildInfo.name
        };

        dump.forEach(async (messages, cid) => {
            const channelInfo = await guildInfo.channels.fetch(cid);
            const channelRow = {
                id: BigInt(cid),
                name: channelInfo.name,
                guildId: BigInt(gid)
            }
            messages.forEach(async m => {
                const messageInfo = await (channelInfo as GuildTextBasedChannel).messages.fetch(m.id.toString());
                const userRow = {
                    id: m.authorId,
                    tag: messageInfo.author.tag,
                }
            });
        });

        const content = "Done!";

        await interaction.followUp({
            ephemeral: true,
            content,
        });
    }
};