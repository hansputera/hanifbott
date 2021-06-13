import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class HelpCommand implements ICommand {
    public name = "help";
    public description = "List perintah";
    public aliases = ["halp", "hulp", "h", "bantuan", "daftar-bantuan"];
    public ownerOnly = false;
    public cooldown = 1000;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const command = args[0];
        if (command) {
            const cmd = this.bot.commands.get(command) || this.bot.commands.get(this.bot.aliases.get(command));
            if (!cmd) return await ctx.reply("Bisa lebih spesifik lagi?", {
                reply_to_message_id: ctx.message.message_id
            });
            else {
                await ctx.replyWithMarkdown(
                    `Perintah **${cmd.name}**\n- Deskripsi: \`${cmd.description}\`\nMemiliki beberapa alias perintah yaitu: ${cmd.aliases.map(alias => `${alias}`).join(", ")}\nDan perintah ini ${cmd.ownerOnly ? "tidak dapat diakses oleh umum yang berarti hanya bisa di akses oleh creator saja" : "dapat diakses oleh semua orang terkecuali bot"}.\nCooldown untuk perintah ini adalah **${cmd.cooldown !== 0 ? Math.floor(cmd.cooldown / 1000) + " detik" : "tidak ada"}**`, {
                        reply_to_message_id: ctx.message.message_id
                    }
                );
            }
        } else {
            const categories = Array.from(this.bot.categories, ([_, category]) => category).filter(c => !c.hidden);
            let text = `Hallo @${ctx.from.username ? ctx.from.username : "-"}, berikut adalah list/daftar kategori dan perintah di dalam nya.\n\n`;
            for (const category of categories) {
                text += `+ **${category.name}** (${category.commands.map(cmd => `${cmd.name}`).join(", ")})\n`;
            }
            text += "\n\nIngin mengetahui detil perintahnya? Gunakan `/help <NAMA_PERINTAH>`.\nTidak menggunakan `<>` dan ganti `NAMA_PERINTAH` dengan nama perintah yang tersedia diatas, contoh penggunaan: `/help ping`";
            await ctx.replyWithMarkdown(text.trim(), { reply_to_message_id: ctx.message.message_id });
        }
    }
}