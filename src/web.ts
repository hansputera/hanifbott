import fastify from "fastify";
const app = fastify({ logger: true });

export default async function main_website(port = process.env.PORT || 3000) {
    app.get("/", (_, reply) => {
        reply.send("Hello world!");
    });
    const address = await app.listen(port, "0.0.0.0");
    console.log("Listening to:", address);
}