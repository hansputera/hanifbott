import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class IDCommand implements ICommand {
    public name = "id";
    public description = "Menunjukan ID chat sekarang dan id user kamu!";
    public aliases = [];
    public ownerOnly = false;
    public cooldown = 2000;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX) {
        await ctx.replyWithMarkdown(`Chat ID: ${ctx.chat.id}\n${ctx.chat.type !== "private" ? `${this.bot.lodash.capitalize(ctx.chat.type)} Name: ${ctx.chat.title}\n\n` : ""}Your Username: @${ctx.from.username ? ctx.from.username : "-"}\nYour ID: ${ctx.from.id}\nLanguage: ${ctx.from.language_code}`);
    }
}