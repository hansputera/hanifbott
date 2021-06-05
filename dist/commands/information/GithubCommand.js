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
class GithubCommand {
    constructor(bot) {
        this.bot = bot;
        this.name = "github";
        this.description = "Mencari user github";
        this.aliases = ["git-hub", "githoob"];
        this.ownerOnly = false;
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = args[0];
            if (!username)
                return yield ctx.replyWithMarkdown("Masukan username, contoh: `/github hansputera`", { reply_to_message_id: ctx.message.message_id });
            try {
                const response = yield this.bot.request("https://api.github.com", `/users/${encodeURIComponent(username)}`);
                const json = yield response.json();
                const created = luxon_1.DateTime.fromISO(json.created_at).toUTC(+7).toFormat("FF", {
                    locale: "id-ID"
                });
                const updated = json.updated_at ? luxon_1.DateTime.fromISO(json.updated_at).toUTC(+7).toFormat("FF", {
                    locale: "id-ID"
                }) : "Tidak ada";
                yield ctx.replyWithPhoto(json.avatar_url, {
                    reply_to_message_id: ctx.message.message_id,
                    caption: `Username: [${json.login}](${json.html_url})\nNama: ${json.name}\nBio: ${json.bio ? json.bio : "-"}\nEmail: ${json.email ? json.email : "Tidak dipublikasikan"}\nLokasi: ${json.location ? json.location : "Tidak dipublikasikan"}\nHireable: ${json.hireable ? "Ya" : "Tidak"}\nPerusahaan: ${json.company ? json.company : "Tidak dipublikasikan"}\nTwitter: ${json.twitter_username ? json.twitter_username : "Tidak dipublikasikan"}\nRepository: ${json.public_repos} repository\nGist: ${json.public_gists} gist\nFollowers: ${json.followers}\nFollowing: ${json.following}\nDibuat: ${created}\nDi-Update: ${updated}`,
                    parse_mode: "Markdown"
                });
            }
            catch (_a) {
                yield ctx.replyWithMarkdown(`\`${username}\` tidak dapat ditemukan, bisa lebih spesifik lagi?`, {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        });
    }
}
exports.default = GithubCommand;
