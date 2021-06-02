import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class PingCommand implements ICommand {
    public name = "ping";
    public description = "Ping Pong";
    public aliases = ["pong"];
    public cooldown = 5000;
    public ownerOnly = false;
    public groupOnly = false;
    constructor(private _: Bot) {}
    public async execute(ctx: CTX) {
        await ctx.reply("Pong!", {
            reply_to_message_id: ctx.message.message_id
        });
    }
}