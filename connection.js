//connect to mongodb atlas (vercel) and return the connection

const { MongoClient } = require("mongodb");
require('dotenv').config();
// Replace the following with your Atlas connection string
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        return client;
    } catch (err) {
        console.log(err.stack);
    }
}

module.exports = run;

