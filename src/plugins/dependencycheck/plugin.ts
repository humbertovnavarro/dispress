import DiscordBot from "../../lib/dispress/DiscordBot"
import type { Plugin } from "../../lib/dispress/dispress"
interface PluginDepencencyContext {
    depends?: string[];
}
const plugin: Plugin = {
    name: "dependencycheck",
    onReady: (bot: DiscordBot) => {
        bot.plugins.forEach(plugin => {
            const pluginWithDepends = plugin as Plugin<PluginDepencencyContext>;
            const pluginContext = pluginWithDepends.context;
            if(!pluginContext) return;
            if(!pluginContext.depends) return;
            pluginContext.depends.forEach(dependency => {
                const versionInt = versionStringToInt(dependency.split("@")[1]);
                const pluginName = dependency.split("@")[0];
                const pluginInBot = bot.plugins.get(pluginName);
                if(!pluginInBot) {
                    console.error(`Plugin ${plugin.name} depends on ${pluginName}>=${versionInt} but ${pluginName} is missing`);
                    process.exit(1);
                }
                const pluginInt = versionStringToInt(pluginInBot?.name.split("@")[1] ?? "0.0.0");
                if(versionInt > pluginInt) {
                    console.error(`Plugin ${plugin.name} depends on ${pluginName}>=${versionInt} but ${pluginName} is at version ${pluginInt}`);
                    process.exit(1);
                }
            });
        })
    }
}

function versionStringToInt(version: string): number {
    let versionInt = 0;
    const versionSplit = version.split(".");
    versionSplit.forEach(versionPart => {
        versionInt *= 100;
        versionInt += Number(versionPart);
    })
    return versionInt;
}
export default plugin;