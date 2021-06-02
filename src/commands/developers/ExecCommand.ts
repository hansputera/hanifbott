import { exec } from "child_process";
import type { CTX, ICommand } from "../../types";

export default class ExecCommand implements ICommand {
    public name = "exec";
    public description = "Eksekusi perintah bash";
    public aliases = ["execute", "bash"];
    public ownerOnly = true;
    public async execute(ctx: CTX, args: string[]) {
        if (!args.length) return await ctx.reply("Mohon masukan argumen yang akan dieksekusi!", { reply_to_message_id: ctx.message.message_id });
        exec(args.join(" "), async (error, stdout, stderr) => {
            if (error || stderr) return await ctx.replyWithMarkdown("```" + error || stderr + "```", { reply_to_message_id: ctx.message.message_id });
            else await ctx.replyWithMarkdown(`\`\`\`${stdout.length ? stdout : "Executed"}\`\`\``, { reply_to_message_id: ctx.message.message_id });
        });
    }
}