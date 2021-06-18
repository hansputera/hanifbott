import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class DebugCommand implements ICommand {
    public name = "debug";
    public description = "Debug pesan";
    public aliases = ["dbg", "debog"];
    public ownerOnly = false;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX) {
        const replyMsg = ctx.message.reply_to_message;
        if (!replyMsg) return await ctx.reply("Mohon reply sebuah pesan!", {
            reply_to_message_id: ctx.message.message_id
        });
        const output = `{\n${JSON.stringify(replyMsg, null, 2)}`;
        ctx.replyWithMarkdown(`\`\`\`${output}\`\`\``, { reply_to_message_id: ctx.message.message_id }).catch(() => {
            this.bot.util.hastebin(output).then((res) => {
                ctx.replyWithMarkdown(`Pesan terlalu panjang jadi aku masukin ke hastebin ya: ${res.url}`, {
                    reply_to_message_id: ctx.message.message_id
                });
            });
        });
    }
}