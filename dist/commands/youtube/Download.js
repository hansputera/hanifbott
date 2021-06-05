"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = __importStar(require("uuid"));
class DownloadCommand {
    constructor(bot) {
        this.bot = bot;
        this.name = "download";
        this.description = "Mendownload video atau audio dari youtube!";
        this.aliases = ["dl-youtube", "download-youtube", "dlyoutube", "dl-yt"];
        this.cooldown = 10000;
        this.ownerOnly = false;
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.bot.db.db.has(`dowloadProcess-${ctx.from.id}`))
                return yield ctx.reply("Kamu sedang ada proses download, mohon tunggu sebentar!", { reply_to_message_id: ctx.message.message_id });
            const { args: Args, flags } = this.bot.util.parseQuery(args);
            const query = Args.join(" ");
            if (!query.length)
                return yield ctx.replyWithMarkdown("Mohon masukan nama video youtube!\nContoh: /download Teletubies Episodes. Ini otomatis mendownload versi MP3, jika anda ingin mendapatkan versi MP4. Bisa menambahkan spasi lalu `--mp4`", {
                    reply_to_message_id: ctx.message.message_id
                });
            let type = "audio";
            if (flags.includes("mp4"))
                type = "video";
            const { videos } = yield this.bot.youtube.find(query);
            if (!videos.length)
                return yield ctx.reply("Maaf, aku tak bisa menemukannya!", { reply_to_message_id: ctx.message.message_id });
            let buttons = [];
            videos.forEach((video, i) => {
                const id = uuid.v4().split("-")[0];
                this.bot.db.set(id, {
                    downloader: true,
                    userId: ctx.from.id,
                    type,
                    url: video.link
                });
                buttons.push({
                    text: `${i + 1}. ${video.title}`,
                    callback_data: id
                });
            });
            if (buttons.length == videos.length)
                yield ctx.replyWithMarkdown(`Silahkan pilih salah satu video dibawah ini dari ${videos.length} video yang diberikan dengan cara di klik!`, {
                    reply_to_message_id: ctx.message.message_id,
                    reply_markup: {
                        selective: true,
                        inline_keyboard: [
                            buttons
                        ]
                    }
                });
        });
    }
}
exports.default = DownloadCommand;
