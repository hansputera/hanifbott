import type { Update, Message } from "typegram";
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
        const json = await (await request("https://hastebin.com", "/documents", {
            method: "POST",
            body: text
        })).json();
        
        return { url: `https://hastebin.com/${json.key}`, code: json.key as string };
    }
    static async getBinContent(code: string) {
        const raw = await (await request("https://hastebin.com", `/raw/${code}`)).text();
        return raw;
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
}