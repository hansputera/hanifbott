import puppeteer from "puppeteer";
import Util from "./util";

export default class Shortener {
    static async sdotid(url: string) {
        if (!Util.isValidURL(url)) return false;
        
        // launching browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto("https://home.s.id");
        
        // requesting to api
        const shortCode = await page.evaluate(async(url) => {
            return await new Promise((resolve) => {
                const csrf = $("[name=\"csrf-token\"]").attr("content");
                fetch("/api/public/link/shorten", {
                    method: "POST",
                    headers: {
                        "X-CSRF-TOKEN": csrf
                    },
                    body: new URLSearchParams({
                        url: url
                    })
                }).then((response) => response.json()).then(json => {
                    if (json.errors) resolve("Error: " + JSON.stringify(json.errors) + " - " + url);
                    else resolve(json.short);
                }).catch((e) => resolve("Error: " + e));
            });
        }, url);
        await page.close();
        await browser.close();
        return shortCode;
    }
}
