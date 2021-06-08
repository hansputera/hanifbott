import type { InlineKeyboardButton } from "typegram";
import * as uuid from "uuid";
import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class SearchProductsCommand implements ICommand {
    public name = "searchproductpstore";
    public description = "Mencari produk di P-Store";
    public aliases = ["cariprodukpstore", "caripstore", "pstorecariproduk"];
    public ownerOnly = false;
    public cooldown = 8000;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const query = args.join(" ");
        if (!query.length) return await ctx.reply("Mohon masukan nama produk yang ingin dicari!", { reply_to_message_id: ctx.message.message_id });
        const m = await ctx.reply("Mohon tunggu", { parse_mode: "Markdown" });
        let products = await this.bot.pstore.fetchProducts(query);
        if (!products.length) return await ctx.tg.editMessageText(ctx.chat.id, m.message_id, "", "Tidak dapat menemukan produk tersebut!");
        if (products.length > 5) products = products.slice(0, 5);
        const buttons: InlineKeyboardButton[] = [];
        const texts: string[] = [];
        products.forEach((product, index) => {
            const identifier = uuid.v4().split("-")[0];
            this.bot.db.set(identifier, {
                pstore_product: true,
                userId: ctx.from.id,
                mid: m.message_id,
                ...product
            });
            buttons.push({
                text: `${index+1}`,
                callback_data: identifier
            });
            texts.push(`${index+1}. [${product.product}](${product.url})`);
        });
        const trashIdentifier = uuid.v4().split("-")[1];
        this.bot.db.set(trashIdentifier, {
            mid: m.message_id,
            userId: ctx.from.id,
            trash: true,
            pstore_product: true
        });
        buttons.push({
            text: "🗑",
            callback_data: trashIdentifier
        });
        this.bot.db.set(`${m.message_id}`, buttons);
        await ctx.tg.editMessageText(ctx.chat.id, m.message_id, "", `Pilih salah satu tombol dibawah ini!\n\n${texts.join("\n")}`, { reply_markup: { inline_keyboard: [buttons] }, parse_mode: "Markdown" });
    }
}