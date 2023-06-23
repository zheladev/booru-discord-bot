import { BaseGuildTextChannel, ChannelType, Client, GuildTextBasedChannel } from "discord.js";
import { IdMap } from "../types";
import { parseDiscordMessage } from "./message"
import { IMessage } from "../interfaces/IMessage";
import { IUser } from "../interfaces/IUser";

//returns object with channel ids mapped to their name
export const getChannelIds = async (c: Client, gid: string): Promise<IdMap<string>> => {
    const guild = await c.guilds.fetch(gid);
    const channels = (await guild.channels.fetch()).filter(c => c.type == ChannelType.GuildText);
    return channels.reduce((acc: IdMap<string>, val) => {
        acc[val.id] = val.name;
        return acc;
    }, {});
}

export const getAllGuildMessages = async (c: Client, gid: string): Promise<Map<string, Array<IMessage>>> => {
    //TODO: save somewhere - what to use for the bot's persistence layer?

    let map = new Map();

    const guild = await c.guilds.fetch(gid);
    const channels = await (guild.channels.fetch());

    //Using this for..of loop because await doesn't work as expected when using forEach loop.
    //channel shouldn't be an array (?)
    for (let channel of channels) {
        if (channel[1].type === ChannelType.GuildText) {
            map.set(channel[1].id, await (getAllChannelMessages(c, gid, channel[1].id)));
        }
    }
    return map;
}

export const getAllChannelMessages = async (c: Client, gid: string, cid: string): Promise<Array<IMessage>> => {
    const channel = await (await c.guilds.fetch(gid)).channels.fetch(cid) as BaseGuildTextChannel;
    if (!channel) return [];

    let messages = [], iter = true;
    let lastId = "";
    let n = 1;

    let messagesArr = await (channel as GuildTextBasedChannel).messages.fetch({ limit: 100 });
    // id 0 = newest
    while (iter) { //eh
        lastId = messagesArr.last()?.id;
        if (!lastId) { iter = false; continue; }
        messages = messages.concat(messagesArr.map((m): IMessage => {
            return parseDiscordMessage(m);
        }));

        messagesArr = await (channel as GuildTextBasedChannel).messages.fetch({ limit: 100, before: lastId });
        iter = messagesArr.size != 0;
    }

    return messages;
}

export const getOlderChannelMessagesPaginated = async (c: Client, gid: string, cid: string, olderThanId?: string): Promise<Array<IMessage>> => {
    const channel = await (await c.guilds.fetch(gid)).channels.fetch(cid) as BaseGuildTextChannel;
    if (!channel) return [];

    let messages = await (channel as GuildTextBasedChannel).messages.fetch({
        before: olderThanId,
        limit: 100
    });

    return messages.map(parseDiscordMessage);
}

export const getNewerChannelMessagesPaginated = async (c: Client, gid: string, cid: string, newerThanId: string): Promise<Array<IMessage>> => {
    const channel = await (await c.guilds.fetch(gid)).channels.fetch(cid) as BaseGuildTextChannel;
    if (!channel) return [];

    let messages = await (channel as GuildTextBasedChannel).messages.fetch({
        after: newerThanId,
        limit: 100
    });

    return messages.map(parseDiscordMessage);
}

//returns object with user ids mapped to some of their info.
export const getGuildMembers = async (c: Client, gid: string): Promise<IdMap<IUser>> => {
    const guild = await c.guilds.fetch(gid);
    const members = await guild.members.fetch();

    return members.reduce((acc: IdMap<IUser>, val) => {
        const ui: IUser = {
            id: BigInt(val.id),
            tag: val.user.tag,
        }
        acc[val.id] = ui;
        return acc;
    }, {});
}
