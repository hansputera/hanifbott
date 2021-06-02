import { resolve } from "path";
import type { CallbackQuery } from "typegram";
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

bot.on("callback_query", async (ctx) => {
    const callbackQuery = (ctx.update.callback_query as CallbackQuery & {
        data: any;
    });
    const key_haste = callbackQuery.data;
    const json = JSON.parse(await bot.util.getBinContent(key_haste));
    
    // validate user
    if (callbackQuery.from.id !== json.userId) return await ctx.answerCbQuery("Kamu tidak diizinkan untuk mengeklik tombol ini!");
    // YouTube Downloader
    if (json.downloader) {
        const info = await bot.youtube.info(json.url);
        if (info.videoDetails.isPrivate) return await ctx.answerCbQuery("Video ini private, tidak bisa di download!");
        await ctx.deleteMessage(callbackQuery.message.message_id);
        const buff = bot.youtube.download(json.url, resolve(__dirname, "..", "assets", `d-${callbackQuery.from.id}`));
        const txt = await bot.youtube.toHumanText(json.url);
        if (json.type === "video") return await ctx.replyWithVideo({ source: buff }, {
            caption: txt
        });
        else await ctx.replyWithAudio({ source: buff }, {
            caption: txt
        });
    }
});