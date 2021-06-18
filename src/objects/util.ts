import type { Update, Message, MessageEntity } from "typegram";
import bot from "..";
import request from "./request";

export default class Util {
    static parseCommand(message: Update.New & Update.NonChannel & Message.TextMessage, username: string) {
        const entity = message.entities[0];
    
        const rawCommand = message.text.substring(1, entity.length);
        let command: string| undefined;
        if (rawCommand.search("@") === -1)
            command = rawCommand;
        else {
            const usernameIn = rawCommand.substring(rawCommand.search("@")).split(/ +/g)[0].replace("@", "");
            if (usernameIn != username) return undefined;
            command = rawCommand.substring(0, rawCommand.search("@"));
        }
    
        let args: string[] = [];
        if (message.text.length > entity.length) {
            args = message.text.slice(entity.length + 1).split(" ");
        }
    
        return {args, command};
    }
    static async hastebin(text: string) {
       const { data: json } = await request("https://hastebin.com").post("/documents", text);
        
        return { url: `https://hastebin.com/${json.key}`, code: json.key as string };
    }
    static async getBinContent(code: string) {
        const raw = await request("https://hastebin.com").get("/raw/" + code);
        return raw.data;
    }
    static isValidURL(url: string) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    static timeString(seconds: number, forceHours = false) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor(seconds % 3600 / 60);

		return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
	}
    static parseQuery(queries: string[]) {
        const args: string[] = [];
        const flags: string[] = [];
        for (const query of queries) {
          if (query.startsWith("--")) flags.push(query.slice(2).toLowerCase());
          else args.push(query);
        }
        return { args, flags };
    }
    static removeHTMLTags(input: string) {
        return input.replace(/(<br?\s?\/>)/ig, " \n").replace(/(<([^>]+)>)/ig, "");
    }
    static async isAdmin(chatId: number, userId: number) {
        const administrators = await bot.telegram.getChatAdministrators(chatId);
        const user = administrators.find(adm => adm.user.id === userId);
        if (!user) return undefined;
        else if (user.status == "creator") return user;
        else return user.can_delete_messages ? user : undefined;
    }
    static matchContent(source: string, target: string) {
        const words = source.split(/\s/g);
        for (let index = 0; index < words.length; index++) {
            const word = words[index];
            const cleanWord = bot.lodash.deburr(word).normalize("NFKD").replace(/[^\x00-\x7F]/g,"");
            if (cleanWord == target) return true;
        }
        return false;
    }
    static isValidEntityText(entities: MessageEntity[]) {
        if (!entities) return false;
        return entities.filter(entity => entity.type == "bold" || entity.type == "underline" || entity.type == "strikethrough" || entity.type == "italic" || entity.type == "code" || entity.type == "pre" || entity.type == "text_link").length ? true : false;
    }
    static parseEntityText(entities: MessageEntity[], text: string) {
        const entitiesText = entities.filter(entity => entity.type == "bold" || entity.type == "underline" || entity.type == "strikethrough" || entity.type == "italic" || entity.type == "code" || entity.type == "pre" || entity.type == "text_link");
        if (!entitiesText.length) return undefined;
        const entText = entitiesText.map(entity => {
            const txt = text.slice(entity.offset, entity.length);
            switch(entity.type) {
                case "bold":
                    return `<b>${txt}</b>`;
                case "italic":
                    return `<i>${txt}</i>`;
                case "code":
                    return `<code>${txt}</code>`;
                case "pre":
                    return `<pre>${txt}</pre>`;
                case "underline":
                    return `<u>${txt}</u>`;
                case "text_link":
                    return `<a href="${entity.url}">${txt}</a>`;
                case "strikethrough":
                    return `<strike>${txt}</strike>`;
                default:
                    break;
            }
        }).join(" ");
        return entText;

    }
}