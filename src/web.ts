import fastify from "fastify";
import bot from ".";
const app = fastify({ logger: true });

export default async function main_website(port = process.env.PORT || 3000) {
    app.get("/", (_, reply) => {
        reply.send("Hello world!");
    });
    app.get("/brainly", {
        preHandler: (req, res, next) => {
            if (!req.query["q"]) return res.send("Missing parameters!");
            else next();
        }
    }, async (req, reply) => {
        const queries = await bot.brainly.fetch(req.query["q"]);
        reply.send(queries);
    });
    app.get("/pstore", {
        preHandler: (req, res, next) => {
            if (!req.query["q"]) return res.send("Missing parameters!");
            else next();
        }
    }, async (req, reply) => {
        const queries = await bot.pstore.fetchProducts(req.query["q"], req.query["page"] ? req.query["page"] : 1);
        reply.send(queries);
    });
    const address = await app.listen(port, "0.0.0.0");
    console.log("Listening to:", address);
}