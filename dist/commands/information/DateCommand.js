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
const luxon_1 = require("luxon");
class DateCommand {
    constructor() {
        this.name = "date";
        this.description = "Lupa tanggal? Hari ini hari apa? Jam berapa? Tenang...";
        this.aliases = ["tanggal", "jam", "hari"];
        this.ownerOnly = false;
    }
    execute(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = luxon_1.DateTime.now().setLocale("id");
            // WIB, WITA, WIT
            const wib = now.toUTC(+7);
            const wita = now.toUTC(+8);
            const wit = now.toUTC(+9);
            yield ctx.replyWithMarkdown(`Jangan lupa waktu lagi ya ^_\n\nKalau kamu Waktu Indonesia Barat: ${wib.toFormat("FFF")}\nOh iya, kalau kamu Waktu Indonesia Bagian Tengah ini ya: ${wita.toFormat("FFF")}\nDan, yang terakhir kamu yang paling timur ini ya: ${wit.toFormat("FFF")}`, {
                reply_to_message_id: ctx.message.message_id
            });
        });
    }
}
exports.default = DateCommand;
