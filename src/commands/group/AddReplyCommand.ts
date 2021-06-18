import type { ReplyMessage, PhotoSize, Sticker, ParseMode, Message, MessageEntity } from "typegram";
import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class AddReplyCommand implements ICommand {
    public name = "addreply";
    public description = "Menambahkan custom reply pada groupmu.\nJika kamu me-reply sebuuah pesan, maka hal itu yang akan di-input ke dalam sistem.";
    public aliases = ["tambahbalasan", "setreply", "acr", "addcustomreply"];
    public ownerOnly = false;
    public groupOnly = true;
    public adminOnly = true;
    
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const identifier = args[0];
        if (!identifier) return await ctx.reply("Mohon masukan identifier!", { reply_to_message_id: ctx.message.message_id });
        const replyMsg = ctx.message.reply_to_message as ReplyMessage & {
            caption?: string;
            photo?: PhotoSize[];
            sticker?: Sticker;
            text?: string;
            entities?: MessageEntity[];
        } | undefined;
        if (replyMsg) {
            if (replyMsg.sticker) {
                const stickerFile = await this.bot.telegram.getFileLink(replyMsg.sticker.file_id);
                const stickerUrl = stickerFile.origin + stickerFile.pathname;
                const addedReply = await this.bot.autoReply.add(ctx.chat.id, identifier, "", stickerUrl, "");
                if (addedReply) return await ctx.reply("Sukses menambahkan custom reply!");
                else return await ctx.reply("Gagal menambahkan custom reply!");
            } else if (replyMsg.photo) {
                const addedReply = await this.bot.autoReply.add(ctx.chat.id, identifier, replyMsg.caption, undefined, replyMsg.photo[0].file_id);
                if (addedReply) return await ctx.reply("Sukses menambahkan custom reply!");
                else return await ctx.reply("Gagal menambahkan custom reply!");
            } else {
                const addedReply = await this.bot.autoReply.add(ctx.chat.id, identifier, this.bot.util.isValidEntityText(replyMsg.entities) ? this.bot.util.parseEntityText(replyMsg.entities, replyMsg.text) : replyMsg.text, "", "");
                if (addedReply) return await ctx.reply("Sukses menambahkan custom reply!");
                else return await ctx.reply("Gagal menambahkan custom reply!");
            }
        } else {
            args.shift();
            const { flags, args: Args } = this.bot.util.parseQuery(args);
            let respType = "normal";
            if (!Args.length) return await ctx.replyWithMarkdown("Kamu harus memasukan respons!\nInfo: Tambahkan spasi lalu \`--markdown\` untuk respons dengan format markdown, \`--html\` untuk format HTML, dan \`--markdown2\` untuk format markdown v2", { reply_to_message_id: ctx.message.message_id });
            
            if (flags.includes("markdown")) respType = "Markdown";
            if (flags.includes("markdown2")) respType = "MarkdownV2";
            if (flags.includes("html")) respType = "HTML";
            // testing format
            ctx.reply("Test: " + Args.join(" "), respType != "normal" ? { parse_mode: respType as ParseMode } : {}).catch(() => {
                ctx.reply("Sepertinya ada kesalahan dalam penulisanmu, coba perbaiki lagi ya", { reply_to_message_id: ctx.message.message_id });
            }).then((mer: Message.TextMessage) => {
                this.bot.autoReply.add(ctx.chat.id, identifier, this.bot.util.isValidEntityText(ctx.message.entities) ? this.bot.util.parseEntityText(ctx.message.entities, ctx.message.text) : Args.join(" "), "", "").then((successful) => {
                    ctx.deleteMessage(mer.message_id);
                    if (successful) return ctx.reply("Sukses ditambahkan!");
                    else return ctx.reply("Gagal ditambahkan!\nKemungkinan identifier sudah ada!");
                });
            });
        }
    }
}