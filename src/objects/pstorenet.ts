import cheerio from "cheerio";
import request from "./request";

export default class PStoreNetScraper {
    public request = request("https://p-store.net", {
        headers: {
            "user-agent": "PStoreNet/Bot-Scraper"
        }
    });
    public async fetchProducts(query: string, page?: number) {
        const response = await this.request.get(`/search?query=${encodeURIComponent(query)}&page=${page ? page : 1}`);
        const products = this.parseProducts(response.data);
        return products;
    }

    private parseProducts(html: string) {
        const $ = cheerio.load(html);
        const products = [];
        if (!$(".cusongslist .col-cusong").length) return products;
        $(".cusongslist .col-cusong").each((index, element) => {
            const url = $(element).find(".songperson a").attr("href");
            const price = $(element).find(".songperson .price").text().trim();
            const img = $(element).find(".songperson a img").attr("src");
            const product = $(element).find(".songperson a img").attr("alt").trim();
            const express = $(element).find("p .scriptolution-express").length ? true : false;
            const seller_name = $(element).find(".userdata .username").text().trim();
            const seller_verified = $(element).find(".userdata .username img").length ? true : false;
            const seller_url = $(element).find(".userdata .username a").attr("href");
            const seller_img = $(element).find(".userdata .userimg a img").attr("src");

            products[index] = { product, url, price, img, express, seller_name, seller_verified, seller_url, seller_img };
        });
        return products;
    }

    public async fetchUser(username: string) {
        try {
            const response = await this.request.get(`/user/${encodeURIComponent(username)}`);
            const $ = cheerio.load(response.data);

            const name = $(".userbannertext h3").text().trim();
            const description = $(".userbannertext h2").text().trim();
            let countStars = 0;
            $(".userbannertext .find-userrating img").each((_, element) => {
                const onStar = /on/gi.test($(element).attr("src"));
                if (onStar) countStars += 1.0;
            });
            const image = $(".profile-image img").attr("src");
            const metas = $(".otherinfo").text();
            const products = this.parseProducts(response.data);
            const verified = $(".scriptolution-jobsbyuser img").attr("src");
            const isOnline = $(".scriptolution-jobsbyuser").text().trim().includes("online");

            return { name, description, countStars, image, metas, products, verified, isOnline };
        } catch {
            return undefined;
        }
    }
}