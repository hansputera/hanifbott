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
        this.name = "id";
        this.description = "Menunjukan ID chat sekarang dan id user kamu!";
        this.aliases = [];
        this.ownerOnly = false;
        this.cooldown = 2000;
    }
    execute(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ctx.replyWithMarkdown(`Chat ID: ${ctx.chat.id}\n${ctx.chat.type !== "private" ? `${this.bot.lodash.capitalize(ctx.chat.type)} Name: ${ctx.chat.title}\n\n` : ""}Your Username: @${ctx.from.username}\nYour ID: ${ctx.from.id}\nLanguage: ${ctx.from.language_code}`);
        });
    }
}
exports.default = IDCommand;
