import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";
import * as uuid from "uuid";

export default class BrainlyCommand implements ICommand {
    public name = "brainly";
    public description = "Mengambil data soal dan jawaban dari brainly!";
    public aliases = ["brenli", "brainnlly"];
    public cooldown = 10000;
    public ownerOnly = false;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const query = args.join(" ");
        if (!query.length) return await ctx.reply("Masukan soal, contoh: /brainly Apa itu pancasila?", { reply_to_message_id: ctx.message.message_id });
        const m = await ctx.reply("Mohon tunggu ...", { reply_to_message_id: ctx.message.message_id });
        const queries = await this.bot.brainly.fetch(query);
        await ctx.deleteMessage(m.message_id);
        if (!queries.length) return await ctx.reply("Aku tidak bisa menemukan pertanyaan itu, spesifik bole?", { reply_to_message_id: ctx.message.message_id });
        const buttons = [];
        let _ = [];
        const texts: string[] = [];
        queries.filter(q => q.node).forEach((soal, index) => {
            const identifier = uuid.v4().split("-")[0];
            const obj = {
                userId: ctx.from.id,
                brainly: true,
                qid: soal.node.databaseId,
                aid: soal.node.author.databaseId,
                author: soal.node.author.nick,
                content: this.bot.util.removeHTMLTags(soal.node.content),
                media: soal.node.attachments.length ? soal.node.attachments.map(attach => attach.url) : [],
                answers: soal.node.answers.nodes.map(answer => ({
                    content: this.bot.util.removeHTMLTags(answer.content),
                    attachments: answer.attachments.length ? answer.attachments.map(attach => attach.url) : [],
                    rating: "⭐️".repeat(Math.floor(answer.rating))
                }))
            }
            this.bot.db.set(identifier, obj);
            if ((index+1) % 5) {
                _.push({ text: `${index+1}`, callback_data: identifier });
            } else {
                _.push({ text: `${index+1}`, callback_data: identifier });
                buttons.push(_);
                _ = [];
            }
            texts.push(`${index+1} - [${obj.content.length > 30 ? obj.content.slice(0, 30) + "..." : obj.content}](https://brainly.co.id/tugas/${obj.qid})`);
        });
        if (_.length) buttons.push(_);
        this.bot.db.save();
        const selem = await ctx.replyWithMarkdown("Mohon pilih salah satu nomor dibawah ini! berdasarkan daftar pertanyaan!\n\n" + texts.join("\n"), { reply_markup: { inline_keyboard: buttons, selective: true}, reply_to_message_id: ctx.message.message_id });
        const selid = selem.message_id;
        this.bot.db.set(`brainly-${selid}`, 0);
        setTimeout(() => {
            const procedd = this.bot.db.get(`brainly-${selid}`);
            if (!procedd) {
                this.bot.db.toArray().forEach((doc) => {
                    if (typeof doc.value === "object" && doc.value.brainly && doc.value.userId == ctx.from.id) this.bot.db.delete(doc.name);
                });
                this.bot.db.delete(`brainly-${selid}`);
                this.bot.db.save();
                if (selem) {
                    ctx.deleteMessage(selid);
                }
            }
        }, 10 * 1000);
    } 
}