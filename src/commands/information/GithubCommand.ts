import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";
import { DateTime } from "luxon";

export default class GithubCommand implements ICommand {
    public name = "github";
    public description = "Mencari user github";
    public aliases = ["git-hub","githoob"];
    public ownerOnly = false;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const username = args[0];
        if (!username) return await ctx.replyWithMarkdown("Masukan username, contoh: `/github hansputera`", { reply_to_message_id: ctx.message.message_id });

        try {
            const response = await this.bot.request("https://api.github.com").get(`/users/${encodeURIComponent(username)}`);
            const json = response.data;

            const created = DateTime.fromISO(json.created_at).toUTC(+7).toFormat("FF", {
                locale: "id-ID"
            });
            const updated = json.updated_at ? DateTime.fromISO(json.updated_at).toUTC(+7).toFormat("FF", {
                locale: "id-ID"
            }) : "Tidak ada";

            await ctx.replyWithPhoto(json.avatar_url, {
                reply_to_message_id: ctx.message.message_id,
                caption: `Username: [${json.login}](${json.html_url})\nNama: ${json.name ? json.name : "Not Set"}\nBio: ${json.bio ? json.bio : "-"}\nEmail: ${json.email ? json.email : "Tidak dipublikasikan"}\nLokasi: ${json.location ? json.location : "Tidak dipublikasikan"}\nHireable: ${json.hireable ? "Ya" : "Tidak"}\nPerusahaan: ${json.company ? json.company : "Tidak dipublikasikan"}\nTwitter: ${json.twitter_username ? json.twitter_username : "Tidak dipublikasikan"}\nRepository: ${json.public_repos} repository\nGist: ${json.public_gists} gist\nFollowers: ${json.followers}\nFollowing: ${json.following}\nDibuat: ${created}\nDi-Update: ${updated}`,
                parse_mode: "Markdown",
                reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "GitHub Account",
                                url: "https://github.com/" + json.login
                            }]
                        ]
                    }
                });
        } catch {
            await ctx.replyWithMarkdown(`\`${username}\` tidak dapat ditemukan, bisa lebih spesifik lagi?`, {
                reply_to_message_id: ctx.message.message_id
            });
        }
    }
}