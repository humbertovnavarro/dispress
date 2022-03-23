import client from "../lib/client";
import dotenv from "dotenv";
dotenv.config();
describe("Discord connection test", () => {
  test("Connects to discord", (done) => {
    const TOKEN = process.env.TOKEN;
    const PRODUCTION = process.env.PRODUCTION;
    if(!PRODUCTION || PRODUCTION.toLocaleLowerCase() === "false") {
      done();
      return;
    }
    try {
      client.login(TOKEN);
    } catch(error) {
      throw (error);
    }
    client.on("ready", done);
  }, 5000);
})
