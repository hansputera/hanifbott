import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { resolve } from "path/posix";
import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class Covid19Command implements ICommand {
    public name = "covid19";
    public description = "Menunjukan presentase dan chart covid19 di seluruh dunia atau negara";
    public aliases = ["covid", "corona"];
    public ownerOnly = false;
    public filters = [-1001182246595];
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const country = args[0];
        const chart = new ChartJSNodeCanvas({ width: 400, height: 400, chartCallback: (chartJS) => {
            chartJS.defaults.font.family = "To the point regular";
        } });
        chart.registerFont(resolve(__dirname, "..", "..", "..", "assets", "ToThePointRegular.ttf"), { family: "To the point regular" });
        const { data: json } = await this.bot.request("https://disease.sh/v3").get(!country ? "/covid-19/all" : `/covid-19/countries/${encodeURIComponent(country)}`);;
        const text = `${country ? `- Statistik COVID19 di ${json.country} -\n` : ""}Kasus: ${json.cases.toLocaleString()}\nKematian: ${json.deaths.toLocaleString()}\nSembuh: ${json.recovered.toLocaleString()}\n\n**HARI INI**\n- Kasus: ${json.todayCases.toLocaleString()}\n- Kematian: ${json.todayDeaths.toLocaleString()}\n- Kesembuhan: ${json.todayRecovered.toLocaleString()}\n\nSource: [Disease API](https://disease.sh)`;
        const chartImage = await chart.renderToBuffer({
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
        await ctx.replyWithPhoto({ source: chartImage }, {
            caption: text,
            parse_mode: "Markdown"
        });    
    }
}