import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class DeleteReplyCommand implements ICommand {
    public name = "deletereply";
    public description = "Menghapus autoreply yang dipasang!";
    public aliases = ["delreply", "delereply"];
    public ownerOnly = false;
    public groupOnly = true;
    public adminOnly = true;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const identifier = args[0];
        if (!identifier) return await ctx.reply("Mohon masukan identifier/pattern yang dimaksud!", { reply_to_message_id: ctx.message.message_id });
        const deleteIdent = await this.bot.autoReply.delete(ctx.chat.id, identifier);
        if (deleteIdent) return await ctx.replyWithMarkdown(`Sukses delete autoreply dengan pattern: \`${deleteIdent.identifier}\``);
        else return await ctx.replyWithMarkdown("Gagal menghapus autoreply!\nKemungkinan identifier tidak ditemukan!");
    }
}