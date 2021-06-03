import { CTX, ICommand } from "../../types";

export default class TranslateCommand implements ICommand {
    public name = "translate";
    public description = "Translate bahasa ke bahasa lainnya";
    public aliases = ["tr", "translateit", "trit", "teranselet", "transilit"];
    public ownerOnly = false;
    public async execute(ctx: CTX, args: string[]) {
        const toLang = args[0];
        if (!toLang) return await ctx.reply("Masukan target negara yang benar!", { reply_to_message_id: ctx.message.message_id });
    }
}