import { readdir } from "fs";
import { resolve } from "path";
import { Context, Telegraf, TelegramError } from "telegraf";
import type { Update } from "typegram";
import type { ICategory, ICommand } from "../types";
import request from "./request";
import TemporaryDatabase from "./temporarydb";
import Util from "./util";
import YouTube from "./youtube";
import lodash from "lodash";
import Shortener from "./shortener";

export default class Bot extends Telegraf {
    public lodash = lodash;
    public util: typeof Util = Util;
    public request = request;
    public youtube = YouTube;
    public shortener = Shortener;
    public db = new TemporaryDatabase(resolve(__dirname, "..", "..", "assets", "databases"));
    public categories: Map<string, ICategory> = new Map();
    public commands: Map<string, ICommand> = new Map();
    public aliases: Map<string, string> = new Map();

    constructor(token: string, options?: Partial<Telegraf.Options<Context<Update>>>) {
        super(token, options);
    }
 
    /**
     * Load all events in specified folder.
     * 
     * @param {String} directory - Path directory for events place.
     * 
     */
    public loadCommands(directory: string): void {
        readdir(directory, (err, categories) => {
            if (err) throw new TelegramError({
                description: err.message,
                error_code: parseInt(err.code!)
            });
            console.info("Found", categories.length, "categories");
            categories.forEach((category) => {
                const cconfig: ICategory = require(`${directory}/${category}/category.js`).default;
                cconfig.commands = [];
                this.categories.set(cconfig.name, cconfig);
                readdir(`${directory}/${category}`, (error, cmds) => {
                    if (err) throw new TelegramError({
                        error_code: parseInt(error.code!),
                        description: error.message
                    });
                    console.info("Found", cmds.length - 1, "commands");
                    cmds.filter(cmd => cmd.endsWith(".js") && !cmd.startsWith("category")).forEach((cmd) => {
                        const cmdc: ICommand = new (require(`${directory}/${category}/${cmd}`).default)(this);
                        if (!cmdc.cooldown) cmdc.cooldown = 5000;
                        if (!cmdc.filters) cmdc.filters = [];
                        cmdc.aliases.forEach(alias => {
                            this.aliases.set(alias, cmdc.name);
                        });
                        cconfig.commands.push(cmdc);
                        this.commands.set(cmdc.name, cmdc);
                    });
                });
            });
        });
    }

    public reloadCommands(directory: string): void {
        this.commands.clear();
        this.aliases.clear();
        this.categories.clear();
        this.loadCommands(directory);
    }
}