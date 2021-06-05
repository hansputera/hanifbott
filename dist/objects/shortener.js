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
const puppeteer_1 = __importDefault(require("puppeteer"));
const util_1 = __importDefault(require("./util"));
class Shortener {
    static sdotid(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!util_1.default.isValidURL(url))
                return false;
            // launching browser
            const browser = yield puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = yield browser.newPage();
            yield page.goto("https://home.s.id");
            // requesting to api
            const shortCode = yield page.evaluate((url) => __awaiter(this, void 0, void 0, function* () {
                return yield new Promise((resolve) => {
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
            }));
            yield page.close();
            yield browser.close();
            return shortCode;
        });
    }
}
exports.default = Shortener;
