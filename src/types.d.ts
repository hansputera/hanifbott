import type { ObjectId } from "bson";
import type { Context, NarrowedContext } from "telegraf";
import type { Chat, Message, PhotoSize, ReplyMessage, Sticker, Update } from "typegram";

export type CTX = NarrowedContext<Context, Update> & {
    message: Message.TextMessage & {
        sticker?: Sticker;
        photo?: PhotoSize[];
        caption?: string;
    };
};
export interface ICategory
{
    name: string;
    hidden: boolean;
    commands: ICommand[];
}

export interface ICommand
{
    name: string;
    description: string;
    aliases: string[];
    ownerOnly: boolean;
    cooldown?: number;
    groupOnly?: boolean;
    adminOnly?: boolean;
    filters?: number[];
    execute(ctx: CTX, args: string[]): any | Promise<any>;
}

export interface IBrainlyResponse {
    highlight: {
        contentFragments: string[];
    }
    node: {
        id: string;
        databaseId: number;
        content: string;
        author: {
            avatar: string | null;
            databaseId: number;
            id: string;
            isDeleted: boolean;
            nick: string;
            rank: {
                name: string;
            }
        }
        answers: {
            hasVerified: boolean;
            nodes: {
                ratesCount: number;
                rating: number;
                thanksCount: number;
                content: string;
                attachments: { url: string; }[];
            }[];
        }
        attachments: { url: string; }[];
    }
}

export interface AutoReplyChat
{
    _id: ObjectId;
    chatId: number;
    identifier: string;
    content: string;
    sticker: string;
    attachment: string;
}