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
class IDCommand {
    constructor(bot) {
        this.bot = bot;
        this.name = "shortlink";
        this.description = "Memendekan url kamu dengan s.id";
        this.aliases = ["sidlink"];
        this.ownerOnly = false;
        this.cooldown = 8000;
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = args[0];
            if (!q)
                return yield ctx.reply("Mohon masukan tautan yang akan diperpendek!", { reply_to_message_id: ctx.message.message_id });
            const short = yield this.bot.shortener.sdotid(q);
            if (!short)
                return yield ctx.reply("Tautan kamu invalid, coba lagi!", { reply_to_message_id: ctx.message.message_id });
            else
                yield ctx.reply(`Ini tautan pendek kamu: ${short}`, { reply_to_message_id: ctx.message.message_id });
        });
    }
}
exports.default = IDCommand;
