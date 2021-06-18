import { MongoClient } from "mongodb";
import config from "../config";

const client = new MongoClient(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
client.connect();

export default client.db("inihanif_bot");