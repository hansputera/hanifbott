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
const fs_1 = require("fs");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const util_1 = __importDefault(require("./util"));
const scrape_youtube_1 = __importDefault(require("scrape-youtube"));
class YouTube {
    static download(url, path) {
        // Download video dulu.
        return ytdl_core_1.default(url, {
            quality: "highest",
            lang: "id"
        }).pipe(fs_1.createWriteStream(path));
    }
    static info(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ytdl_core_1.default.getInfo(url);
        });
    }
    static find(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield scrape_youtube_1.default.search(query, options);
        });
    }
    static toHumanText(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.info(url);
            const durationText = util_1.default.timeString(parseInt(info.videoDetails.lengthSeconds));
            return `Judul: [${info.videoDetails.title}](${info.videoDetails.video_url})\nKanal: [${info.videoDetails.author.name}](${info.videoDetails.author.channel_url})\nSuka: ${info.videoDetails.likes.toLocaleString()}\nTidak Suka: ${info.videoDetails.dislikes.toLocaleString()}\nDurasi: ${durationText}`;
        });
    }
}
exports.default = YouTube;
YouTube.ytdl = ytdl_core_1.default;
