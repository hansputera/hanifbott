import { inspect } from "util";
import type Bot from "../../objects/bot";
import type { CTX, ICommand } from "../../types";

export default class EvalCommand implements ICommand {
    public name = "eval";
    public description = "Mengeksekusi kode javascript";
    public aliases = ["evaluate"];
    public ownerOnly = true;
    public cooldown = 1000;
    constructor(private bot: Bot) {}
    public async execute(ctx: CTX, args: string[]) {
        const { args: Args, flags } = parseQuery(args);
        try {
            if (!args.length) return await ctx.reply("Perintah eval harus memiliki argumen!", { reply_to_message_id: ctx.message.message_id });
            let code = Args.join(" ");
            let depth = 0;
            if (flags.includes("async")) {
                code = `(async() => {
                    ${code}
                })()`;
            }
            if (flags.some(flag => flag.includes("depth"))) {
                depth = parseInt(flags.find(flag => flag.includes("depth")).split("=")[1], 10);
            }
            let { evaled, type } = await parseEval(eval(code));
            if (flags.includes("silent")) return;
            if (typeof evaled !== "string") evaled = inspect(evaled, { depth });
            evaled = evaled
                    .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                    .replace(/@/g, `@${String.fromCharCode(8203)}`);
            if (evaled.length > 5000) evaled = await this.bot.util.hastebin(evaled);
            await ctx.replyWithMarkdown(`**Input:** \`\`\`${code}\`\`\`\n\n**Output:** \`\`\`${evaled}\`\`\`\n**Type:** \`${type}\``, {
                reply_to_message_id: ctx.message.message_id
            });
        } catch (e) {
            await ctx.replyWithMarkdown(`\`\`\`${e}\`\`\``, { reply_to_message_id: ctx.message.message_id });
        }
    }
}

function parseType(input: any) {
    if (input instanceof Buffer) {
      let length = Math.round(input.length / 1024 / 1024);
      let ic = "MB";
      if (!length) {
        length = Math.round(input.length / 1024);
        ic = "KB";
      }
      if (!length) {
        length = Math.round(input.length);
        ic = "Bytes";
      }
      return `Buffer (${length} ${ic})`;
    }
    return input === null || input === undefined ? "Void" : input.constructor.name;
  }

  async function parseEval(input: any) {
    const isPromise =
      input instanceof Promise &&
      typeof input.then === "function" &&
      typeof input.catch === "function";
    if (isPromise) {
      input = await input;
      return {
        evaled: input,
        type: `Promise<${parseType(input)}>`
      };
    }
    return {
      evaled: input,
      type: parseType(input)
    };
  }

  
function parseQuery(queries: string[]) {
    const args: string[] = [];
    const flags: string[] = [];
    for (const query of queries) {
      if (query.startsWith("--")) flags.push(query.slice(2).toLowerCase());
      else args.push(query);
    }
    return { args, flags };
  }