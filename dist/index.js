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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const config_1 = __importDefault(require("./config"));
const bot_1 = __importDefault(require("./objects/bot"));
const bot = new bot_1.default(config_1.default.token);
const cooldowns = new Map();
bot.launch().then(() => {
    console.log("Logged in");
    bot.loadCommands(path_1.resolve(__dirname, "commands"));
});
const commands = Array.from(bot.commands, ([_, command]) => ({ command: command.name, description: command.description }));
bot.telegram.setMyCommands(commands).catch(console.error);
bot.on("text", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const me = yield bot.telegram.getMe();
    const text = ctx.update.message.text.toLowerCase();
    if (text.startsWith("/")) {
        const match = text.match(/^\/([^\s]+)\s?(.+)?/);
        let args = [];
        let command;
        if (match !== null) {
            const parsers = bot.util.parseCommand(ctx.message, me.username);
            if (!parsers)
                return;
            command = parsers.command;
            args = parsers.args;
        }
        const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
        if (cmd) {
            if (cmd.ownerOnly && ctx.from.id !== config_1.default.ownerID)
                return;
            if (!cooldowns.has(cmd.name))
                cooldowns.set(cmd.name, new Map());
            const now = Date.now();
            const timestamps = cooldowns.get(cmd.name);
            const cooldownAmount = (cmd.cooldown || 5000);
            if (!timestamps.has(ctx.from.id)) {
                timestamps.set(ctx.from.id, now);
            }
            else {
                const expirationTime = timestamps.get(ctx.from.id) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    console.log(ctx.from.username, "cooldown", timeLeft.toFixed(2));
                    return;
                }
                timestamps.set(ctx.from.id, now);
                setTimeout(() => timestamps.delete(ctx.from.id), cooldownAmount);
            }
            try {
                cmd.execute(ctx, args);
            }
            catch (error) {
                console.error(error);
                yield ctx.reply("Maaf, sepertinya ada error di sistem kami", { reply_to_message_id: ctx.message.message_id });
            }
            finally {
                console.info(ctx.from.username, "|", ctx.from.id, "menggunakan perintah", cmd.name, "di", ctx.chat.id);
            }
        }
    }
}));
