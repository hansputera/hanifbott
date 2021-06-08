import { DateTime } from "luxon";
import type { CTX, ICommand } from "../../types";

export default class DateCommand implements ICommand {
    public name = "date";
    public description = "Lupa tanggal? Hari ini hari apa? Jam berapa? Tenang...";
    public aliases = ["tanggal", "jam", "hari"];
    public ownerOnly = false;
    public async execute(ctx: CTX) {
        const now = DateTime.now().setLocale("id");

        // WIB, WITA, WIT
        const wib = now.setZone("Asia/Jakarta");
        const wita = now.setZone("Asia/Makassar");
        const wit = now.setZone("Asia/Jayapura");

        await ctx.replyWithMarkdown(`Jangan lupa waktu lagi ya <3\n\nKalau kamu Waktu Indonesia Barat: \`${wib.toFormat("FFF")}\`\nOh iya, kalau kamu Waktu Indonesia Bagian Tengah ini ya: \`${wita.toFormat("FFF")}\`\n\nDan, yang terakhir kamu yang paling timur ini ya: \`${wit.toFormat("FFF")}\``, {
            reply_to_message_id: ctx.message.message_id
        });
    }
}