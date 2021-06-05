"use strict";
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
class HelpCommand {
    constructor(bot) {
        this.bot = bot;
        this.name = "help";
        this.description = "List perintah";
        this.aliases = ["halp", "hulp", "h", "bantuan", "daftar-bantuan"];
        this.ownerOnly = false;
        this.cooldown = 1000;
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = args[0];
            if (command) {
                const cmd = this.bot.commands.get(command) || this.bot.commands.get(this.bot.aliases.get(command));
                if (!cmd)
                    return yield ctx.reply("Bisa lebih spesifik lagi?", {
                        reply_to_message_id: ctx.message.message_id
                    });
                else {
                    yield ctx.replyWithMarkdown(`Perintah **${cmd.name}**\n- Deskripsi: \`${cmd.description}\`\nMemiliki beberapa alias perintah yaitu: ${cmd.aliases.map(alias => `${alias}`).join(", ")}\nDan perintah ini ${cmd.ownerOnly ? "tidak dapat diakses oleh umum yang berarti hanya bisa di akses oleh creator saja" : "dapat diakses oleh semua orang terkecuali bot"}.\nCooldown untuk perintah ini adalah **${cmd.cooldown !== 0 ? Math.floor(cmd.cooldown / 1000) + " detik" : "tidak ada"}**`, {
                        reply_to_message_id: ctx.message.message_id
                    });
                }
            }
            else {
                const categories = Array.from(this.bot.categories, ([_, category]) => category).filter(c => !c.hidden);
                let text = `Hallo @${ctx.from.username}, berikut adalah list/daftar kategori dan perintah di dalam nya.\n\n`;
                for (const category of categories) {
                    text += `+ **${category.name}** (${category.commands.map(cmd => `${cmd.name}`).join(", ")})\n`;
                }
                text += "\n\nIngin mengetahui detil perintahnya? Gunakan `/help <NAMA_PERINTAH>`.\nTidak menggunakan `<>` dan ganti `NAMA_PERINTAH` dengan nama perintah yang tersedia diatas, contoh penggunaan: `/help ping`";
                yield ctx.replyWithMarkdown(text.trim(), { reply_to_message_id: ctx.message.message_id });
            }
        });
    }
}
exports.default = HelpCommand;
