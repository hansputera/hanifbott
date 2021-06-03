import type { InlineKeyboardButton } from "typegram";
import * as uuid from "uuid";
import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class DownloadCommand implements ICommand {
    public name = "download";
    public description = "Mendownload video atau audio dari youtube!";
    public aliases = ["dl-youtube", "download-youtube", "dlyoutube", "dl-yt"];
    public cooldown = 10000;
    public ownerOnly = false;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        if (this.bot.db.db.has(`dowloadProcess-${ctx.from.id}`)) return await ctx.reply("Kamu sedang ada proses download, mohon tunggu sebentar!", { reply_to_message_id: ctx.message.message_id });
        const { args: Args, flags } = this.bot.util.parseQuery(args);
        const query = Args.join(" ");
        if (!query.length) return await ctx.replyWithMarkdown("Mohon masukan nama video youtube!\nContoh: /download Teletubies Episodes. Ini otomatis mendownload versi MP3, jika anda ingin mendapatkan versi MP4. Bisa menambahkan spasi lalu `--mp4`", {
            reply_to_message_id: ctx.message.message_id
        });
        let type = "audio";
        if (flags.includes("mp4")) type = "video";
        const { videos } = await this.bot.youtube.find(query);
        if (!videos.length) return await ctx.reply("Maaf, aku tak bisa menemukannya!", { reply_to_message_id: ctx.message.message_id });
        let buttons: InlineKeyboardButton[] = [];
        videos.forEach((video, i) => {
            const id = uuid.v4().split("-")[0];
            this.bot.db.set(id, {
                downloader: true,
                userId: ctx.from.id,
                type,
                url: video.link
            });
            buttons.push({
                text: `${i+1}. ${video.title}`,
                callback_data: id
            });
        });
        await ctx.replyWithMarkdown(`Silahkan pilih salah satu video dibawah ini dari ${videos.length} video yang diberikan dengan cara di klik!`, {
            reply_to_message_id: ctx.message.message_id,
            reply_markup: {
                selective: true,
                inline_keyboard: [
                   buttons
                ]
            }
        });
    }
}