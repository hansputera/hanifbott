import { resolve } from "path";
import config from "./config";
import Bot from "./objects/bot";

const bot = new Bot(config.token);
const cooldowns: Map<string, Map<number, number>> = new Map();
bot.launch().then(() => {
    console.log("Logged in");
    bot.loadCommands(resolve(__dirname, "commands"));
});
const commands = Array.from(bot.commands, ([_, command]) => ({ command: command.name, description: command.description }));
bot.telegram.setMyCommands(commands).catch(console.error);

bot.on("text", async (ctx) => {
    const me = await bot.telegram.getMe();
    const text = ctx.update.message.text.toLowerCase();
    if (text.startsWith("/")) {
            const match = text.match(/^\/([^\s]+)\s?(.+)?/);
            let args: string[] = [];
            let command: string | undefined;
            if (match !== null) {
                const parsers = bot.util.parseCommand(ctx.message, me.username);
                if (!parsers) return;
                command = parsers.command;
                args = parsers.args;
            }
            const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
            if (cmd) {
                if (cmd.ownerOnly && ctx.from.id !== config.ownerID) return;
                if (!cooldowns.has(cmd.name)) cooldowns.set(cmd.name, new Map());
                const now = Date.now();
                const timestamps = cooldowns.get(cmd.name);
                const cooldownAmount = (cmd.cooldown! || 5000);
                if (!timestamps.has(ctx.from.id)) {
                    timestamps.set(ctx.from.id, now);
                } else {
                    const expirationTime = timestamps.get(ctx.from.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        console.log(ctx.from.username, "cooldown", timeLeft.toFixed(2));
                        return;
                    }
                   timestamps.set(ctx.from.id, now);
                   setTimeout(() => timestamps.delete(ctx.from.id), cooldownAmount);
                }
                try {
                    cmd.execute(ctx, args);
                } catch (error) {
                    console.error(error);
                    await ctx.reply("Maaf, sepertinya ada error di sistem kami", { reply_to_message_id: ctx.message.message_id });
                } finally {
                    console.info(ctx.from.username, "|", ctx.from.id, "menggunakan perintah", cmd.name, "di", ctx.chat.id);
                }
            }
        }
});