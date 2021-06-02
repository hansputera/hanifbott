"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
}
exports.default = Util;
