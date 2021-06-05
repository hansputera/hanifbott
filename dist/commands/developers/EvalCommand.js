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
const util_1 = require("util");
class EvalCommand {
    constructor(bot) {
        this.bot = bot;
        this.name = "eval";
        this.description = "Mengeksekusi kode javascript";
        this.aliases = ["evaluate"];
        this.ownerOnly = true;
        this.cooldown = 1000;
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { args: Args, flags } = this.bot.util.parseQuery(args);
            try {
                if (!args.length)
                    return yield ctx.reply("Perintah eval harus memiliki argumen!", { reply_to_message_id: ctx.message.message_id });
                let code = Args.join(" ");
                let depth = 0;
                if (flags.includes("async")) {
                    code = `(async() => {
                    ${code}
                })()`;
                }
                if (flags.some(flag => flag.includes("depth"))) {
                    depth = parseInt(flags.find(flag => flag.includes("depth")).split("=")[1], 10);
                }
                let { evaled, type } = yield parseEval(eval(code));
                if (flags.includes("silent"))
                    return;
                if (typeof evaled !== "string")
                    evaled = util_1.inspect(evaled, { depth });
                evaled = evaled
                    .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                    .replace(/@/g, `@${String.fromCharCode(8203)}`);
                if (evaled.length > 5000)
                    evaled = (yield this.bot.util.hastebin(evaled)).url;
                yield ctx.replyWithMarkdown(`**Input:** \`\`\`${code}\`\`\`\n\n**Output:** \`\`\`${evaled}\`\`\`\n**Type:** \`${type}\``, {
                    reply_to_message_id: ctx.message.message_id
                });
            }
            catch (e) {
                yield ctx.replyWithMarkdown(`\`\`\`${e}\`\`\``, { reply_to_message_id: ctx.message.message_id });
            }
        });
    }
}
exports.default = EvalCommand;
function parseType(input) {
    if (input instanceof Buffer) {
        let length = Math.round(input.length / 1024 / 1024);
        let ic = "MB";
        if (!length) {
            length = Math.round(input.length / 1024);
            ic = "KB";
        }
        if (!length) {
            length = Math.round(input.length);
            ic = "Bytes";
        }
        return `Buffer (${length} ${ic})`;
    }
    return input === null || input === undefined ? "Void" : input.constructor.name;
}
function parseEval(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const isPromise = input instanceof Promise &&
            typeof input.then === "function" &&
            typeof input.catch === "function";
        if (isPromise) {
            input = yield input;
            return {
                evaled: input,
                type: `Promise<${parseType(input)}>`
            };
        }
        return {
            evaled: input,
            type: parseType(input)
        };
    });
}
