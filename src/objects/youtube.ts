import { PathLike, createWriteStream, unlinkSync, readFileSync } from "fs";
import ytdl from "ytdl-core";
import Util from "./util";
import youtube from "scrape-youtube";
import type { SearchOptions } from "scrape-youtube/lib/interface";

export default class YouTube {
    static download(url: string, path: PathLike) {
        // Download video dulu.
        ytdl(url, {
            quality: "highest",
            lang: "id"
        }).pipe(createWriteStream(path));
        // Kalau selesai baru baca filenya.
        const buffer = readFileSync(path);
        // Kan udah dapat buffernya nih, kita hapus filenya.
        unlinkSync(path);
        // Return buffernya.
        return buffer;
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
        return `Judul: [${info.videoDetails.title}](${info.videoDetails.video_url})\nKanal: [${info.videoDetails.author.name}](${info.videoDetails.author.channel_url})\nDeskripsi: ${info.videoDetails.description}\nSuka: ${info.videoDetails.likes}\nTidak Suka: ${info.videoDetails.dislikes}\nDurasi: ${durationText}`;
    }
}