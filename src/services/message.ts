import type { Attachment, Message as DiscordMessage } from "discord.js";
import { IMessage } from "../interfaces/IMessage";
import { IAttachment } from "../interfaces/IAttachment";

export const parseDiscordMessagesIterable = (iter: Iterable<DiscordMessage>): Array<IMessage> => {
    const messages: Array<IMessage> = [];
    for (const m of iter) {
        messages.push(parseDiscordMessage(m));
    }

    return messages;
}

export const parseDiscordMessage = (message: DiscordMessage): IMessage => {
    return {
        id: BigInt(message.id),
        channelId: BigInt(message.channelId),
        authorId: BigInt(message.author.id),
        content: message.content,
        createdTimestamp: new Date(message.createdTimestamp),
        editedTimestamp: new Date(message.editedTimestamp),
    }
}

export const parseMessageAttachments = (message: DiscordMessage): IAttachment[] => {
    return message.attachments ? message.attachments.map((attachment: Attachment) => { return { ...attachment } }) : [];
}