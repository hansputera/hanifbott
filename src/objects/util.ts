import type { Update, Message } from "typegram";

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
}