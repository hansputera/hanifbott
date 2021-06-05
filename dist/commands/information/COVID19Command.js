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
Object.defineProperty(exports, "__esModule", { value: true });
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const posix_1 = require("path/posix");
class Covid19Command {
    constructor(bot) {
        this.bot = bot;
        this.name = "covid19";
        this.description = "Menunjukan presentase dan chart covid19 di seluruh dunia atau negara";
        this.aliases = ["covid", "corona"];
        this.ownerOnly = false;
        this.filters = [-1001182246595];
    }
    execute(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const country = args[0];
            const chart = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width: 400, height: 400, chartCallback: (chartJS) => {
                    chartJS.defaults.font.family = "To the point regular";
                } });
            chart.registerFont(posix_1.resolve(__dirname, "..", "..", "..", "assets", "ToThePointRegular.ttf"), { family: "To the point regular" });
            const json = yield (yield this.bot.request("https://disease.sh/v3", !country ? "/covid-19/all" : `/covid-19/countries/${encodeURIComponent(country)}`)).json();
            const text = `${country ? `- Statistik COVID19 di ${json.country} -\n` : ""}Kasus: ${json.cases.toLocaleString()}\nKematian: ${json.deaths.toLocaleString()}\nSembuh: ${json.recovered.toLocaleString()}\n\n**HARI INI**\n- Kasus: ${json.todayCases.toLocaleString()}\n- Kematian: ${json.todayDeaths.toLocaleString()}\n- Kesembuhan: ${json.todayRecovered.toLocaleString()}\n\nSource: [Disease API](https://disease.sh)`;
            const chartImage = yield chart.renderToBuffer({
                type: "bar",
                data: {
                    labels: ["Kasus", "Sembuh", "Kematian"],
                    datasets: [{
                            label: country ? country : "",
                            data: [json.cases, json.recovered, json.deaths],
                            backgroundColor: [
                                "rgba(255, 52, 81, 0.31)",
                                "rgba(0, 255, 6, 0.41)",
                                "rgba(255, 0, 0, 0.49)"
                            ],
                            borderColor: [
                                "rgba(255, 26, 0, 0.71)",
                                "rgb(149, 255, 55)",
                                "rgb(255, 76, 76)"
                            ],
                            borderWidth: 2
                        }]
                }
            }, "image/png");
            yield ctx.replyWithPhoto({ source: chartImage }, {
                caption: text,
                parse_mode: "Markdown"
            });
        });
    }
}
exports.default = Covid19Command;
