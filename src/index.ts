import { readFileSync, unlinkSync } from "fs";
import { resolve } from "path";
import type { CallbackQuery } from "typegram";
import config from "./config";
import Bot from "./objects/bot";
import main_website from "./web";

const bot = new Bot(config.token);
const cooldowns: Map<string, Map<number, number>> = new Map();
const cooldownSend: Map<number, boolean> = new Map();

bot.launch().then(() => {
    console.log("Logged in");
    bot.loadCommands(resolve(__dirname, "commands"));
    main_website();
    bot.db.reuse();
});
const commands = Array.from(bot.commands, ([_, command]) => ({ command: command.name, description: command.description }));
bot.telegram.setMyCommands(commands).catch(console.error);

bot.on("text", async (ctx) => {
    if (ctx.from.is_bot) return;
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
            if (cmd && !cmd.filters.includes(ctx.from.id) && !cmd.filters.includes(ctx.chat.id)) {
                if (cmd.ownerOnly && ctx.from.id !== config.ownerID) return;
                if (ctx.from.id !== config.ownerID) {
                    if (!cooldowns.has(cmd.name)) cooldowns.set(cmd.name, new Map());
                    const now = Date.now();
                    const timestamps = cooldowns.get(cmd.name);
                    const cooldownAmount = (cmd.cooldown! || 5000);
                    if (!timestamps.has(ctx.from.id)) {
                        timestamps.set(ctx.from.id, now);
                    } else {
                        const expirationTime = timestamps.get(ctx.from.id) + cooldownAmount;
                        if (now < expirationTime && !cooldownSend.has(ctx.from.id)) {
                            const timeLeft = (expirationTime - now) / 1000;
                            console.log(ctx.from.username, "cooldown", timeLeft.toFixed(2));
                            cooldownSend.set(ctx.from.id, true);
                            await ctx.replyWithMarkdown(`Halo @${ctx.from.username}, mohon tunggu sekitar \`${timeLeft.toFixed(2)}\` detik lagi untuk menggunakan perintah ini.`, { reply_to_message_id: ctx.message.message_id });
                            return;
                        }
                        timestamps.set(ctx.from.id, now);
                        setTimeout(() => {
                            timestamps.delete(ctx.from.id);
                            cooldownSend.delete(ctx.from.id);
                        }, cooldownAmount);
                    }
                }
                if (cmd.groupOnly && ctx.chat.type !== "supergroup") return await ctx.reply("Kamu harus mengeksekusi nya di grup!", { reply_to_message_id: ctx.message.message_id });
                try {
                    cmd.execute(ctx, args);
                } catch (error) {
                    console.error(error);
                    await ctx.reply("Maaf, sepertinya ada error di sistem kami", { reply_to_message_id: ctx.message.message_id });
                } finally {
                    console.info(ctx.from.username, "|", ctx.from.id, "menggunakan perintah", cmd.name, "di", ctx.chat.id);
                    bot.db.save();
                }
            }
        }
});

bot.on("callback_query", async (ctx) => {
    const callbackQuery = (ctx.update.callback_query as CallbackQuery & {
        data: any;
    });
    const keyCode = callbackQuery.data;
    const json = bot.db.get(keyCode);
    // validate message
    if (!json && callbackQuery.message) {
        await ctx.deleteMessage(callbackQuery.message.message_id);
        await ctx.answerCbQuery("Mohon maaf, sepertiny data kamu tidak tersimpan saat bot kami mati. Mohon maaf!");
        return;
    }
    // validate user
    if (callbackQuery.from.id !== json.userId) return await ctx.answerCbQuery("Kamu tidak diizinkan untuk mengeklik tombol ini!");
    // YouTube Downloader
    if (json.downloader) {
        const info = await bot.youtube.info(json.url);
        if (info.videoDetails.isPrivate) return await ctx.answerCbQuery("Video ini private, tidak bisa di download!");
        if (callbackQuery.message) await ctx.deleteMessage(callbackQuery.message.message_id);
        bot.db.toArray().forEach(doc => {
            if (typeof doc.value === "object" && doc.value.downloader) {
                bot.db.delete(doc.name);
            } 
        });
        bot.db.save();
        bot.db.set(`downloadProcess-${ctx.from.id}`, 1);
        const dlPath = resolve(__dirname, "..", "assets", `d-${callbackQuery.from.id}.${json.type === "audio" ? ".mp3" : ".mp4"}`);
        const pipeStream = bot.youtube.download(json.url, dlPath);
        const txt = await bot.youtube.toHumanText(json.url);
        pipeStream.on("finish", () => {
                if (json.type === "video") ctx.replyWithVideo({ filename: info.videoDetails.title, source: readFileSync(dlPath) }, { caption: txt, parse_mode: "Markdown" }).catch(() => ctx.reply("Mohon coba lagi, kemungkinan video terlalu besar untuk dikirim."));
                else ctx.replyWithAudio({ filename: info.videoDetails.title, source: readFileSync(dlPath) }, { caption: txt, parse_mode: "Markdown" }).catch(() => ctx.reply("Mohon coba lagi, kemungkinan video terlalu besar untuk dikirim."));
                unlinkSync(dlPath);
                bot.db.delete(`downloadProcess-${ctx.from.id}`);
                bot.db.save();
        });
    // Brainly
    } else if (json.brainly) {
        await ctx.deleteMessage(callbackQuery.message.message_id);
        bot.db.toArray().forEach((doc) => {
            if (typeof doc.value === "object" && doc.value.brainly) bot.db.delete(doc.name);
        });
        if (json.attachments) await ctx.replyWithPhoto(json.attachments[0], {
            caption: `Ini beberapa jawaban dari soal \`"${json.content.length > 30 ? json.content.slice(0, 30) + "..." : json.content}"\`\n\n${json.answers.map((answer, index) => `${index+1}. ${answer.content}\nRating: ${answer.rating.length ? answer.rating : "-"}${answer.attachments.length ? "\nFoto: " + answer.attachments.join(", ") : ""}`).join("\n\n")}`,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Tautan",
                            url: `https://brainly.co.id/tugas/${json.aid}`
                        }, {
                            text: `${json.author} Profile`,
                            url: `https://brainly.co.id/app/profile/${json.aid}`
                        }
                    ]
                ]
            }
        });
        else await ctx.reply(`Ini beberapa jawaban dari soal \`"${json.content.length > 30 ? json.content.slice(0, 30) + "..." : json.content}"\`\n\n${json.answers.map((answer, index) => `${index+1}. ${answer.content}\nRating: ${answer.rating.length ? answer.rating : "-"}${answer.attachments.length ? "\nFoto: " + answer.attachments.join(", ") : ""}`).join("\n\n")}`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Tautan",
                            url: `https://brainly.co.id/tugas/${json.aid}`
                        }, {
                            text: `${json.author} Profile`,
                            url: `https://brainly.co.id/app/profile/${json.aid}`
                        }
                    ]
                ]
            }
        });
        bot.db.save();
    } else if (json.pstore_product) {
        
        if (json.trash) {
            bot.db.delete(`${callbackQuery.message.message_id}`);
            bot.db.toArray().filter(
                x => x.value.pstore_product && x.value.mid === callbackQuery.message.message_id && x.value.userId === ctx.from.id
            ).forEach(d => bot.db.delete(d.name));
            await ctx.deleteMessage(callbackQuery.message.message_id);
            return;
        }
        const keyboards = bot.db.get(`${callbackQuery.message.message_id}`);
        ctx.tg.editMessageText(ctx.chat.id, callbackQuery.message.message_id, callbackQuery.inline_message_id, `⚙️ Produk: [${json.product}](${json.url})\n💵 Harga: ${json.price}\n🛂 Seller: [${json.seller_name}](${json.seller_url})\n📬 Pengiriman kilat? ${json.express ? "Ya" : "Tidak"}\n✅ Penjual terverifikasi? ${json.seller_verified ? "Ya" : "Tidak"}\n🔸 Preview Photo: ${json.img}\n\nUntuk pilihan lainnya silahkan pilih tombol dibawah ini!`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboards.map((key: { text: string; callback_data: string; }) => ([{ text: key.text, callback_data: key.callback_data }]))
            }
        }).catch(() => {
            ctx.answerCbQuery("Kamu sekarang berada di tombol yang sama, mohon pilih tombol lain ya!");
        });
    }
});

bot.catch(async(err, ctx) => {
    bot.db.save();
    await ctx.tg.sendMessage(config.ownerID, `Executor: ${ctx.from.id} | @${ctx.from.username}\nDate: ${Date.now()}\nError: \`\`\`${err}\`\`\``, { parse_mode: "Markdown" });
});
process.on("SIGINT", () => {
    bot.db.save();
});
process.on("uncaughtException", async (err) => {
    await bot.telegram.sendMessage(config.ownerID, `System Error\nDate: ${Date.now()}\nError: \`\`\`${err}\`\`\``, { parse_mode: "Markdown" });
    bot.db.reuse();
    bot.stop("Restart");
    bot.launch();
});

export default bot;