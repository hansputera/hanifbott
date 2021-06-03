import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class CleanTextCommand implements ICommand {
    public name = "clean-text";
    public description = "Membersihkan teks dari simbol simbol asing";
    public aliases = ["cleantext", "bersihteks"];
    public cooldown = 3000;
    public ownerOnly = false;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const query = args.join(" ");
        if (!query.length) return await ctx.reply("Masukan teks yang mengandung simbol!", {
            reply_to_message_id: ctx.message.message_id
        });
        const text = this.bot.lodash.deburr(query).normalize("NFKD").replace(/[^\x00-\x7F]/g,"");
        await ctx.reply(text.length ? text : "(Empty)", { reply_to_message_id: ctx.message.message_id });
    }
}