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
const child_process_1 = require("child_process");
class ExecCommand {
    constructor() {
        this.name = "exec";
        this.description = "Eksekusi perintah bash";
        this.aliases = ["execute", "bash"];
        this.ownerOnly = true;
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args.length)
                return yield ctx.reply("Mohon masukan argumen yang akan dieksekusi!", { reply_to_message_id: ctx.message.message_id });
            child_process_1.exec(args.join(" "), (error, stdout, stderr) => {
                if (error || stderr)
                    return ctx.replyWithMarkdown("```" + error ? error.message : "..." || stderr.length ? stderr : "..." + "```");
                else
                    ctx.replyWithMarkdown(`\`\`\`${stdout.length ? stdout : "Executed"}\`\`\``, { reply_to_message_id: ctx.message.message_id });
            });
        });
    }
}
exports.default = ExecCommand;
