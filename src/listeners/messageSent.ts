import { Attachment, Client, Collection, Message } from "discord.js";
import { parseDiscordMessage, parseMessageAttachments } from "../services/message";
import { postAttachment } from "../services/booru";

export default (client: Client): void => {
    client.on("messageCreate", async (message: Message) => {
        await handleMessage(client, message);
    });
};

const handleMessage = async (client: Client, message: Message) => {
    const attachments = parseMessageAttachments(message);
    attachments.map(a => postAttachment(a));
}