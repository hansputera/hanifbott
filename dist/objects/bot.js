"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const telegraf_1 = require("telegraf");
const request_1 = __importDefault(require("./request"));
const temporarydb_1 = __importDefault(require("./temporarydb"));
const util_1 = __importDefault(require("./util"));
const youtube_1 = __importDefault(require("./youtube"));
const lodash_1 = __importDefault(require("lodash"));
const shortener_1 = __importDefault(require("./shortener"));
class Bot extends telegraf_1.Telegraf {
    constructor(token, options) {
        super(token, options);
        this.lodash = lodash_1.default;
        this.util = util_1.default;
        this.request = request_1.default;
        this.youtube = youtube_1.default;
        this.shortener = shortener_1.default;
        this.db = new temporarydb_1.default(path_1.resolve(__dirname, "..", "..", "assets", "databases"));
        this.categories = new Map();
        this.commands = new Map();
        this.aliases = new Map();
    }
    /**
     * Load all events in specified folder.
     *
     * @param {String} directory - Path directory for events place.
     *
     */
    loadCommands(directory) {
        fs_1.readdir(directory, (err, categories) => {
            if (err)
                throw new telegraf_1.TelegramError({
                    description: err.message,
                    error_code: parseInt(err.code)
                });
            console.info("Found", categories.length, "categories");
            categories.forEach((category) => {
                const cconfig = require(`${directory}/${category}/category.js`).default;
                cconfig.commands = [];
                this.categories.set(cconfig.name, cconfig);
                fs_1.readdir(`${directory}/${category}`, (error, cmds) => {
                    if (err)
                        throw new telegraf_1.TelegramError({
                            error_code: parseInt(error.code),
                            description: error.message
                        });
                    console.info("Found", cmds.length - 1, "commands");
                    cmds.filter(cmd => cmd.endsWith(".js") && !cmd.startsWith("category")).forEach((cmd) => {
                        const cmdc = new (require(`${directory}/${category}/${cmd}`).default)(this);
                        if (!cmdc.cooldown)
                            cmdc.cooldown = 5000;
                        if (!cmdc.filters)
                            cmdc.filters = [];
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
    reloadCommands(directory) {
        this.commands.clear();
        this.aliases.clear();
        this.categories.clear();
        this.loadCommands(directory);
    }
}
exports.default = Bot;
