import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class IDCommand implements ICommand {
    public name = "shortlink";
    public description = "Memendekan url kamu dengan s.id";
    public aliases = ["sidlink"];
    public ownerOnly = false;
    public cooldown = 8000;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const q = args[0];
        if (!q) return await ctx.reply("Mohon masukan tautan yang akan diperpendek!", { reply_to_message_id: ctx.message.message_id });
        const short = await this.bot.shortener.sdotid(q);
        if (!short) return await ctx.reply("Tautan kamu invalid, coba lagi!", { reply_to_message_id: ctx.message.message_id });
        else if (/error/gi.test(short as string)) {
		await ctx.reply("Sepertiny ada error di sistem saya", { reply_to_message_id: ctx.message.message_id });
        	await ctx.tg.sendMessage("@hanifdwypoetra", `Command: ${this.name}\nID: ${ctx.from.id}\nDate: ${Date.now()}\nError: ${short as string}`, { parse_mode: "Markdown" });
	} else await ctx.reply(`Ini tautan pendek kamu: https://s.id/${short}`, { reply_to_message_id: ctx.message.message_id });
    }
}
