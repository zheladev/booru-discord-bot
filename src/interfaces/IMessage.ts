
export interface IMessage {
    id: BigInt;
    channelId: BigInt;
    authorId: BigInt;
    content: string;
    createdTimestamp: Date;
    editedTimestamp: Date;
}