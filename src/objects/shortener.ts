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
                const csrf = document.querySelector('[name="csrf-token"]').getAttribute("content");
                fetch("/api/public/link/shorten", {
                    headers: {
                        "X-CSRF-TOKEN": csrf
                    },
                    body: new URLSearchParams({
                        url
                    })
                }).then((response) => response.json()).then(json => {
                    resolve(json.short);
                });
            });
        });
        await page.close();
        await browser.close();
        return shortCode;
    }
}