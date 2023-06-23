import axios from "axios";
import { IAttachment } from "../interfaces/IAttachment"
import { config } from "dotenv";

export const processDiscordAttachments = (attachments: IAttachment[]) => {

}

export const postAttachment = (attachment: IAttachment) => {
    const username = process.env.BOORU_USERNAME
    const apiKey = process.env.BOORU_TOKEN
    const postUrl = `https://${username}:${apiKey}@${process.env.BOORU_URL}`
    axios.post(`${postUrl}/uploads.json`, {
        source: attachment.url
    })
        .then(r => console.log(r))
        .catch(e => console.log(e))
}