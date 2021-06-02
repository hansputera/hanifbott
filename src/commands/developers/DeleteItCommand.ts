import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class DeleteItCommand implements ICommand {
    public name = "deleteit";
    public description = "Menghapus pesan bot";
    public aliases = ["deleteini", "deletethis", "delit", "hapusini"];
    public cooldown = 2000;
    public ownerOnly = true;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX) {
        const replied = ctx.message.reply_to_message;
        if (!replied) return await ctx.reply("Mohon reply messageku:)", { reply_to_message_id: ctx.message.message_id });
        if (replied.from.id !== (await this.bot.telegram.getMe()).id) return await ctx.reply("Ini bukan messageku:)", { reply_to_message_id: ctx.message.message_id });
        await ctx.deleteMessage(replied.message_id);
    }
}