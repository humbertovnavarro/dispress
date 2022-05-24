import fs from "fs";
import botFactory from "./main";
describe("discordBot", () => {
    it("should have plugins in plugins folder", (done) => {
        const plugins = getPlugins();
        botFactory().then(bot => {
            plugins.forEach(plugin => {
                try {
                    expect(bot.plugins.get(plugin)?.name).toBe(plugin);
                } catch (error) {
                    console.error("Plugin in plugins directory not found: ", plugin);
                    throw error;
                }
            });
            done();
        }).catch((err) => {
            throw err;
        });
    });
});

function getPlugins() {
    const plugins = fs.readdirSync("./src/plugins");
    return plugins;
}