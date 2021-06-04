import Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class BinCommand implements ICommand {
    public name = "bin";
    public description = "Memasukan teks ke hastebin.com";
    public aliases = ["haste", "hastebin", "paste", "pastebin"];
    public ownerOnly = false;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const text = args.join(" ");
        if (!text.length) return await ctx.reply("Mohon masukan teks!", { reply_to_message_id: ctx.message.message_id });
        const { code, url } = await this.bot.util.hastebin(text);
        await ctx.replyWithMarkdown(`Ini link hastebinmu: ${url} | RAW: https://hastebin.com/raw/${code}`, {
            reply_to_message_id: ctx.message.message_id
        });
    }
}