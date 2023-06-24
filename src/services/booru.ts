import axios, { AxiosError } from "axios";
import { IAttachment } from "../interfaces/IAttachment"
import { config } from "dotenv";
import { search } from '@l2studio/iqdb-api'
import { IBooruUploadCandidate } from "../interfaces/IBooruUploadCandidate";


export const findTagsAndPostAttachment = async (attachment: IAttachment) => {
    const username = process.env.BOORU_USERNAME;
    const apiKey = process.env.BOORU_TOKEN;
    const postUrl = `https://${username}:${apiKey}@${process.env.BOORU_URL}`;
    console.log("Attachment detected, trying to get tags.")

    // const uploadInfo = await axios.get(`${postUrl}/posts/1.json`)
    // console.log(uploadInfo.data)
    try {
        const highestSimilarityTaggedImage = await getHighestSimilarityImage(attachment);
        await postAttachment(highestSimilarityTaggedImage, postUrl);
    } catch (e) {
        console.log(e)
    }


}

const postAttachment = async (taggedFile: IBooruUploadCandidate, postUrl: string) => {
    const ids = {
        uploadId: -1,
        uploadMediaAssetId: -1,
        mediaAssetId: -1
    }
    if (taggedFile) {
        console.log(`Uploading ${taggedFile.name} to danbooru.`)
        const uploadRes = await axios.post(`${postUrl}/uploads.json`, {
            upload: {
                source: taggedFile.url,
            }
        })

        while (ids.mediaAssetId == -1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log(`Retrieving  ${taggedFile.name} upload data.`)
            const uploadInfo = await axios.get(`${postUrl}/uploads/${uploadRes.data.id}.json`)
            if (uploadInfo.data.status === "completed") {

                ids.mediaAssetId = uploadInfo.data.upload_media_assets[0].media_asset_id
                ids.uploadId = uploadInfo.data.id
                ids.uploadMediaAssetId = uploadInfo.data.upload_media_assets[0].id
            }
        }
        console.log(`Posting ${taggedFile.name} from upload data with:`)
        console.log(ids)
        const postRes = await axios.post(`${postUrl}/posts.json`, {
            upload_media_asset_id: ids.uploadMediaAssetId,
            media_asset_id: ids.mediaAssetId,
            upload_id: ids.uploadId,
            tag_string: taggedFile.tags,
            rating: taggedFile.rating,
        })
        console.log("posted!")
    }
}


const getHighestSimilarityImage = async (attachment: IAttachment): Promise<IBooruUploadCandidate> => {
    var uploadCandidate: IBooruUploadCandidate = {
        url: attachment.url,
        tags: "",
        rating: "e",
        source: attachment.url,
        name: attachment.name
    };
    if (attachment.contentType.includes("image") && attachment.size < 1e+7) {
        const iqdbSearchRes = await search(attachment.url);
        const highestSimilarityRes = iqdbSearchRes.results.find(res => res.match === "best")

        if (highestSimilarityRes) {
            // TODO: parse urls and extract file from them (danbooru.com/post/1234 -> cdn.jpg link)
            const bestUrl = attachment.url;
            uploadCandidate = {
                url: bestUrl,
                tags: highestSimilarityRes.thumbnail.tags?.join(" "),
                rating: mapIQDBRatingToBooruRatingTag(highestSimilarityRes.type),
                source: bestUrl,
                name: attachment.name
            }
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