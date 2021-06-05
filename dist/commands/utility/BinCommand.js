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
class BinCommand {
    constructor(bot) {
        this.bot = bot;
        this.name = "bin";
        this.description = "Memasukan teks ke hastebin.com";
        this.aliases = ["haste", "hastebin", "paste", "pastebin"];
        this.ownerOnly = false;
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = args.join(" ");
            if (!text.length)
                return yield ctx.reply("Mohon masukan teks!", { reply_to_message_id: ctx.message.message_id });
            const { code, url } = yield this.bot.util.hastebin(text);
            yield ctx.replyWithMarkdown(`Ini link hastebinmu: ${url} | RAW: https://hastebin.com/raw/${code}`, {
                reply_to_message_id: ctx.message.message_id
            });
        });
    }
}
exports.default = BinCommand;
