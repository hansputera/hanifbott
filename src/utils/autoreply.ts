import type Bot from "../objects/bot";
import type { AutoReplyChat } from "../types";

export default class AutoReply {
    public replycol = this.bot.database.collection("auto-replies");
    constructor(private bot: Bot) {}
    public async add(chatId: number, identifier: string, content?: string, sticker?: string, attachment?: string) {
        if (!content) content = "";
        if (!sticker) sticker = "";
        if (!attachment) attachment = "";

        const data = await this.getIdentifier(chatId, identifier.toLowerCase());
        if (data) return false;
        await this.replycol.insertOne({ chatId, identifier, content, sticker, attachment });
        return true;
    }
    public async edit(chatId: number, identifier: string, content?: string, sticker?: string, attachment?: string) {
        if (!content) content = "";
        if (!sticker) sticker = "";
        if (!attachment) attachment = "";

        const data = await this.getIdentifier(chatId, identifier.toLowerCase());
        if (!data) return false;
        await this.replycol.updateOne({
            chatId, identifier
        }, {
            $set: {
                content, sticker, attachment
            }
        });
        return true;
    }
    public async delete(chatId: number, identifier: string) {
        const data = await this.getIdentifier(chatId, identifier);
        if (!data) return undefined;
        await this.replycol.deleteOne({ chatId, identifier });
        return data;
    }
    public async gets(chatId: number) {
        return await this.replycol.find({ chatId }).toArray() as AutoReplyChat[];
    }
    public async getIdentifier(chatId: number, identifier: string) {
        return await this.replycol.findOne({ chatId, identifier }) as AutoReplyChat | undefined;
    }
    public async getAll() {
        return await this.replycol.find().toArray() as AutoReplyChat[];
    }
}