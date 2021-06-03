import UserAgent from "user-agents";
import request from "./request";

/**
 * Source: https://github.com/plainheart/bing-translate-api
 * 
 */
const LANGS = {
    'auto-detect': 'Auto-detect',
    af: 'Afrikaans',
    am: 'Amharic',
    ar: 'Arabic',
    as: 'Assamese',
    az: 'Azerbaijani',
    bg: 'Bulgarian',
    bn: 'Bangla',
    bs: 'Bosnian',
    ca: 'Catalan',
    cs: 'Czech',
    cy: 'Welsh',
    da: 'Danish',
    de: 'German',
    el: 'Greek',
    en: 'English',
    es: 'Spanish',
    et: 'Estonian',
    fa: 'Persian',
    fi: 'Finnish',
    fil: 'Filipino',
    fj: 'Fijian',
    fr: 'French',
    'fr-CA': 'French (Canada)',
    ga: 'Irish',
    gu: 'Gujarati',
    he: 'Hebrew',
    hi: 'Hindi',
    hr: 'Croatian',
    ht: 'Haitian Creole',
    hu: 'Hungarian',
    hy: 'Armenian',
    id: 'Indonesian',
    is: 'Icelandic',
    it: 'Italian',
    iu: 'Inuktitut',
    ja: 'Japanese',
    kk: 'Kazakh',
    km: 'Khmer',
    kmr: 'Kurdish (Northern)',
    kn: 'Kannada',
    ko: 'Korean',
    ku: 'Kurdish (Central)',
    lo: 'Lao',
    lt: 'Lithuanian',
    lv: 'Latvian',
    mg: 'Malagasy',
    mi: 'Maori',
    ml: 'Malayalam',
    mr: 'Marathi',
    ms: 'Malay',
    mt: 'Maltese',
    mww: 'Hmong Daw',
    my: 'Myanmar',
    nb: 'Norwegian',
    ne: 'Nepali',
    nl: 'Dutch',
    or: 'Odia',
    otq: 'Querétaro Otomi',
    pa: 'Punjabi',
    pl: 'Polish',
    prs: 'Dari',
    ps: 'Pashto',
    pt: 'Portuguese (Brazil)',
    'pt-PT': 'Portuguese (Portugal)',
    ro: 'Romanian',
    ru: 'Russian',
    sk: 'Slovak',
    sl: 'Slovenian',
    sm: 'Samoan',
    sq: 'Albanian',
    'sr-Cyrl': 'Serbian (Cyrillic)',
    'sr-Latn': 'Serbian (Latin)',
    sv: 'Swedish',
    sw: 'Swahili',
    ta: 'Tamil',
    te: 'Telugu',
    th: 'Thai',
    ti: 'Tigrinya',
    'tlh-Latn': 'Klingon (Latin)',
    'tlh-Piqd': 'Klingon (pIqaD)',
    to: 'Tongan',
    tr: 'Turkish',
    ty: 'Tahitian',
    uk: 'Ukrainian',
    ur: 'Urdu',
    vi: 'Vietnamese',
    yua: 'Yucatec Maya',
    yue: 'Cantonese (Traditional)',
    'zh-Hans': 'Chinese Simplified',
    'zh-Hant': 'Chinese Traditional'
}
  
  const LANGS_CAN_CORRECT = [
    'da',
    'en',
    'nl',
    'fi',
    'fr',
    'fr-CA',
    'de',
    'it',
    'ja',
    'ko',
    'no',
    'pl',
    'pt',
    'pt-PT',
    'ru',
    'es',
    'sv',
    'tr',
    'zh-Hant',
    'zh-Hans'
  ];

  /**
   * Kelas statik untuk bahasa.
   * 
   * @class Lang
   * 
   */
class Lang {
    /**
     * Fungsi mendapatkan kode bahasa berdasarkan bahasa.
     * 
     * @param lang - Bahasa yang ingin dicari kodenya.
     * @returns {String} Akan menghasilkan kode bahasa.
     */
    static getLangCode(lang: string) {
        if (!lang) return;
        else if (LANGS[lang]) return lang;
        else {
            lang = lang.toLowerCase();
            const langCodes = Object.keys(LANGS);
            for (let index = 0; index < langCodes.length; index++) {
                const code = langCodes[index];
                if (code.toLowerCase() === lang || (LANGS[code] as string).toLowerCase() === lang) {
                    return code;
                }
            }
        } 
    }

    /**
     * Fungsi yang akan mencari apakah bahasa tersebut support apa tidak.
     * 
     * @param lang - Bahasa yang akan dicari apakah support?
     * @returns {Boolean} Akan menghasilkan boolean true jika support dan false jika tidak.
     */
    static isSupported(lang: string) {
        return !!this.getLangCode(lang);
    }

    /**
     * Fungsi untuk mengecek apakah bahasa itu benar atau salah.
     * 
     * @param lang - Bahasa yang akan dicek apakah benar atau salah?
     * @returns {Boolean} Menghasilkan boolean true jika benar dan false jika salah.
     */
    static canCorrect(lang: string) {
        const langCode = this.getLangCode(lang);
        return langCode && LANGS_CAN_CORRECT.indexOf(langCode) > -1;
    }
}

export default class Translate {
    private TRANSLATE_API_ROOT = "https://{tld}bing.com";
    private TRANSLATE_WEBSITE = "/translator";
    private TRANSLATE_API = "/ttranslatev3?isVertical=1\u0026";
    private TRANSLATE_SPELL_CHECK_API = "/tspellcheckv3?isVertical=1\u0026";
    private CONTENT_TYPE = "application/x-www-form-urlencoded";
    private MAX_TEXT_LEN = 1000;
    private MAX_CORRECT_TEXT_LEN = 50;
    private globalConfig: {
        IG: string;
        IID: string;
        key: string;
        token: string;
        tokenTs: number;
        tokenExpiryInterval: number;
        cookie: string;
        count: number;
    };
    private globalConfigPromise;

    private userAgent = new UserAgent([/Safari/, {
        connection: {
            type: "wifi"
        },
        platform: "MacIntel"
    }]);
    constructor(private useProxy = false) {}
    private replaceTld(url: string, tld: string) {
        if (tld && (tld !== "www" && tld !== "cn")) {
            console.warn(`the tld '${tld}' may not be valid.`);
          }
        return url.replace("{tld}", tld ? tld + "." : "");
    }
    private isTokenExpired() {
        if (!this.globalConfig) return true;
        const { tokenTs, tokenExpiryInterval } = this.globalConfig;
        return Date.now() - tokenTs > tokenExpiryInterval;
    }
    private async fetchGlobalConfig(tld: string, useragent: string, proxy = false) {
        let IG: string, IID: string, token: string, key: string, tokenTs: number, tokenExpiryInterval: number, cookie: string;
        try {
            const url = this.replaceTld(this.TRANSLATE_API_ROOT, tld);
            const response = await request(url, this.TRANSLATE_WEBSITE, proxy, {
                headers: {
                    "User-Agent": useragent
                }
            });
            const body = await response.text();
            cookie = response.headers.raw()["set-cookie"].map(c => c.split(";")[0]).join("; ");
            IG = body.match(/IG:"([^"]+)"/)[1];
            IID = body.match(/data-iid="([^"]+)"/)[1];
            const [_key, _token, interval] = new Function(`return ${body.match(/params_RichTranslateHelper\s?=\s?([^\]]+\])/)[1]}`)();
            key = tokenTs = _key;
            token = _token;
            tokenExpiryInterval = interval;
        } catch (error) {
            console.error(error);
            return await this.fetchGlobalConfig(tld, useragent, true);
        }
        return this.globalConfig = {
            IG,
            IID,
            key,
            token,
            tokenTs,
            tokenExpiryInterval,
            cookie,
            count: 0
        };
    }

    private makeRequestURL(isSpellCheck: boolean, IG: string, IID: string, count: number, tld: string) {
        return this.replaceTld(this.TRANSLATE_API_ROOT + isSpellCheck ? this.TRANSLATE_SPELL_CHECK_API : this.TRANSLATE_API, tld)
        + (IG && IG.length ? '&IG=' + IG : '')
        + (IID && IID.length ? '&IID=' + IID + '.' + count : '');
    }
    private makeRequestBody(isSpellCheck: boolean, text: string, fromLang: string, toLang: string, token: string, key: string) {
        const body = {
            fromLang,
            text,
            token,
            key
          }
          if (!isSpellCheck) {
            body["to"] = toLang
          }
          return new URLSearchParams(body);
    }

    public async translate(text: string, from = "auto-detect", to = "en", correct: boolean, raw: boolean, tld: string, proxy = false, userAgent = this.userAgent.random().toString()) {
        if (!text || !(text = text.trim())) return;
        
          if (text.length > this.MAX_TEXT_LEN) throw new Error(`The supported maximum length of text is ${this.MAX_TEXT_LEN}. Please shorten the text.`);
          if (!this.globalConfigPromise) {
            this.globalConfigPromise = await this.fetchGlobalConfig(tld, userAgent);
          }
          if (this.isTokenExpired()) {
            this.globalConfigPromise = await this.fetchGlobalConfig(tld, userAgent);
          }
          const fromSupported = Lang.isSupported(from);
          const toSupported = Lang.isSupported(to);
          if (!fromSupported || !toSupported) throw new Error(`The language '${!fromSupported ? from : !toSupported ? to : ''}' is not supported!`);
          from = Lang.getLangCode(from);
          to = Lang.getLangCode(to);

          const requestURL = this.makeRequestURL(false, this.globalConfig.IG, this.globalConfig.IID, ++this.globalConfig.count, tld)
          const requestBody = this.makeRequestBody(false, text, from, to === 'auto-detect' ? 'en' : to, this.globalConfig.token, this.globalConfig.key)

        const requestHeaders = {
            'content-type': this.CONTENT_TYPE,
            'user-agent': userAgent,
            referer: this.replaceTld(this.TRANSLATE_API_ROOT + this.TRANSLATE_WEBSITE, tld),
            cookie: this.globalConfig.cookie
        };
        const response = await request(requestURL, "", proxy, {
            method: "POST",
            headers: requestHeaders,
            body: requestBody
        });
        const body = await response.json();
        if (body.ShowCaptcha) return await this.translate(text, from,to, correct, raw, tld, true, userAgent);
        const translation = body[0].translations[0]
        const detectedLang = body[0].detectedLanguage

        const res = {
            text,
            userLang: from,
            translation: translation.text,
            language: {
                from: detectedLang.language,
                to: translation.to,
                score: detectedLang.score
            }
        }

        if (correct) {
            const correctLang = detectedLang.language;
            const matcher = text.match(/"/g);
            const len = text.length + (matcher && matcher.length || 0);
            if (len <= this.MAX_CORRECT_TEXT_LEN && Lang.canCorrect(correctLang)) {
            const requestURL = this.makeRequestURL(true, this.globalConfig.IG, this.globalConfig.IID, ++this.globalConfig.count, tld)
            const requestBody = this.makeRequestBody(true, text, correctLang, null, this.globalConfig.token, this.globalConfig.key)

            const respc = await request(requestURL, "", proxy, {
                headers: requestHeaders,
                body: requestBody
            });
            const hbo
            res["correctedText"] = body && body.correctedText
            }
            else {
            console.warn(`The detected language '${correctLang}' is not supported to be corrected or the length of text is more than ${MAX_CORRECT_TEXT_LEN}.`)
            }
        }
    }
}