import axios, { AxiosError } from "axios";
import { IAttachment } from "../interfaces/IAttachment"
import { config } from "dotenv";
import { search } from '@l2studio/iqdb-api'
import { IBooruUploadCandidate } from "../interfaces/IBooruUploadCandidate";


// TODO: dont upload files over iqdb size limit

export const findTagsAndPostAttachment = async (attachment: IAttachment) => {
    const username = process.env.BOORU_USERNAME;
    const apiKey = process.env.BOORU_TOKEN;
    const postUrl = `https://${username}:${apiKey}@${process.env.BOORU_URL}`;
    console.log("Attachment detected, trying to get tags.")

    // const uploadInfo = await axios.get(`${postUrl}/posts/1.json`)
    // console.log(uploadInfo.data)
    const highestSimilarityTaggedImage = await getHighestSimilarityImage(attachment);
    try {
        await postAttachment(highestSimilarityTaggedImage, postUrl);
    } catch (e) {
        console.log(e.response.data)
    }


}

const postAttachment = async (taggedFile: IBooruUploadCandidate, postUrl: string) => {
    if (taggedFile) {
        console.log(`Uploading ${taggedFile.name} to danbooru.`)
        const uploadRes = await axios.post(`${postUrl}/uploads.json`, {
            upload: {
                source: taggedFile.url,
            }
        })

        let mediaAssetId = null;
        while (!mediaAssetId) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log(`Retrieving  ${taggedFile.name} upload data.`)
            const uploadInfo = await axios.get(`${postUrl}/uploads/${uploadRes.data.id}.json`)
            if (uploadInfo.data.status === "completed") {
                console.log(uploadInfo.data)
                mediaAssetId = uploadInfo.data.upload_media_assets[0].media_asset_id
            }
        }
        console.log(`Posting ${taggedFile.name} from upload data with ${mediaAssetId} media asset id.`)
        console.log(taggedFile)
        const postRes = await axios.post(`${postUrl}/posts.json`, {
            upload_media_asset_id: mediaAssetId,
            tag_string: taggedFile.tags,
            rating: taggedFile.rating,
        })
        console.log("posted!")
    }
}


const getHighestSimilarityImage = async (attachment: IAttachment): Promise<IBooruUploadCandidate> => {
    const iqdbSearchRes = await search(attachment.url);
    //const highestSimilarityRes = iqdbSearchRes.results.reduce((p, c) => p.similarity > c.similarity ? p : c)
    const highestSimilarityRes = iqdbSearchRes.results.find(res => res.match === "best")
    var uploadCandidate: IBooruUploadCandidate;
    if (highestSimilarityRes) {
        //const bestUrl = attachment.width > highestSimilarityRes.width && attachment.height > highestSimilarityRes.height ? attachment.url : highestSimilarityRes.sources[0].fixedHref
        // TODO: parse urls and extract file from them (danbooru.com/post/1234 -> cdn.jpg link)
        const bestUrl = attachment.url;
        uploadCandidate = {
            url: bestUrl,
            tags: highestSimilarityRes.thumbnail.tags?.join(" "),
            rating: mapIQDBRatingToBooruRatingTag(highestSimilarityRes.type),
            source: bestUrl,
            name: attachment.name
        }
    } else {
        uploadCandidate = {
            url: attachment.url,
            tags: "",
            rating: "E",
            source: attachment.url,
            name: attachment.name
        }
    }

    return uploadCandidate;
}

const mapIQDBRatingToBooruRatingTag = (rating: string): string => {
    const ratings = {
        "safe": "g",
        "unrated": "q",
        "ero": "s",
        "explicit": "e"
    }
    return ratings[rating];
}