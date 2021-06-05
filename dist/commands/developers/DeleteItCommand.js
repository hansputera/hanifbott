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
class DeleteItCommand {
    constructor(bot) {
        this.bot = bot;
        this.name = "deleteit";
        this.description = "Menghapus pesan bot";
        this.aliases = ["deleteini", "deletethis", "delit", "hapusini"];
        this.cooldown = 2000;
        this.ownerOnly = true;
    }
    execute(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const replied = ctx.message.reply_to_message;
            if (!replied)
                return yield ctx.reply("Mohon reply messageku:)", { reply_to_message_id: ctx.message.message_id });
            if (replied.from.id !== (yield this.bot.telegram.getMe()).id)
                return yield ctx.reply("Ini bukan messageku:)", { reply_to_message_id: ctx.message.message_id });
            yield ctx.deleteMessage(replied.message_id);
        });
    }
}
exports.default = DeleteItCommand;
