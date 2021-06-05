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
const request_1 = __importDefault(require("./request"));
class Util {
    static parseCommand(message, username) {
        const entity = message.entities[0];
        const rawCommand = message.text.substring(1, entity.length);
        let command;
        if (rawCommand.search("@") === -1)
            command = rawCommand;
        else {
            const usernameIn = rawCommand.substring(rawCommand.search("@")).split(/ +/g)[0].replace("@", "");
            if (usernameIn != username)
                return undefined;
            command = rawCommand.substring(0, rawCommand.search("@"));
        }
        let args = [];
        if (message.text.length > entity.length) {
            args = message.text.slice(entity.length + 1).split(" ");
        }
        return { args, command };
    }
    static hastebin(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield (yield request_1.default("https://hastebin.com", "/documents", {
                method: "POST",
                body: text
            })).json();
            return { url: `https://hastebin.com/${json.key}`, code: json.key };
        });
    }
    static getBinContent(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const raw = yield (yield request_1.default("https://hastebin.com", `/raw/${code}`)).text();
            return raw;
        });
    }
    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    static timeString(seconds, forceHours = false) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
    }
    static parseQuery(queries) {
        const args = [];
        const flags = [];
        for (const query of queries) {
            if (query.startsWith("--"))
                flags.push(query.slice(2).toLowerCase());
            else
                args.push(query);
        }
        return { args, flags };
    }
}
exports.default = Util;
