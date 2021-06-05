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
class CleanTextCommand {
    constructor(bot) {
        this.bot = bot;
        this.name = "clean-text";
        this.description = "Membersihkan teks dari simbol simbol asing";
        this.aliases = ["cleantext", "bersihteks"];
        this.cooldown = 3000;
        this.ownerOnly = false;
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = args.join(" ");
            if (!query.length)
                return yield ctx.reply("Masukan teks yang mengandung simbol!", {
                    reply_to_message_id: ctx.message.message_id
                });
            const text = this.bot.lodash.deburr(query).normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
            yield ctx.reply(text.length ? text : "(Empty)", { reply_to_message_id: ctx.message.message_id });
        });
    }
}
exports.default = CleanTextCommand;
