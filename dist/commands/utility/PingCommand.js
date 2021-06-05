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
class PingCommand {
    constructor(_) {
        this._ = _;
        this.name = "ping";
        this.description = "Ping Pong";
        this.aliases = ["pong"];
        this.cooldown = 5000;
        this.ownerOnly = false;
        this.groupOnly = false;
    }
    execute(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ctx.reply("Pong!", {
                reply_to_message_id: ctx.message.message_id
            });
        });
    }
}
exports.default = PingCommand;
