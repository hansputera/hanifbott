import { exec } from "child_process";
import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class ExecCommand implements ICommand {
    public name = "exec";
    public description = "Eksekusi perintah bash";
    public aliases = ["execute", "bash"];
    public ownerOnly = true;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        if (!args.length) return await ctx.reply("Mohon masukan argumen yang akan dieksekusi!", { reply_to_message_id: ctx.message.message_id });
        exec(args.join(" "), (error, stdout, stderr) => {
            if (error || stderr) return ctx.replyWithMarkdown("```" + error ? error.message : "..." || stderr.length ? stderr : "..." + "```");
            else {
                let out = stdout.length ? stdout : "Executed";
                if (out.length) this.bot.util.hastebin(out).then((resbin) => {
                    out = resbin.url;
                });
                ctx.replyWithMarkdown(`\`\`\`${out}\`\`\``, { reply_to_message_id: ctx.message.message_id });
            }
        });
    }
}