import { PathLike, createWriteStream } from "fs";
import ytdl from "ytdl-core";
import Util from "./util";
import youtube from "scrape-youtube";
import type { SearchOptions } from "scrape-youtube/lib/interface";

export default class YouTube {
    static ytdl = ytdl;
    static download(url: string, path: PathLike) {
        // Download video dulu.
        return ytdl(url, {
            quality: "highest",
            lang: "id"
        }).pipe(createWriteStream(path));
    }
    static async info(url: string) {
        return await ytdl.getInfo(url);
    }
    static async find(query: string, options?: SearchOptions) {
        return await youtube.search(query, options)
    }
    static async toHumanText(url: string) {
        const info = await this.info(url);
        const durationText = Util.timeString(parseInt(info.videoDetails.lengthSeconds));
        return `Judul: [${info.videoDetails.title}](${info.videoDetails.video_url})\nKanal: [${info.videoDetails.author.name}](${info.videoDetails.author.channel_url})\nSuka: ${info.videoDetails.likes}\nTidak Suka: ${info.videoDetails.dislikes}\nDurasi: ${durationText}\nDeskripsi: ${info.videoDetails.description}`;
    }
}