import { Embed, SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import axios from "axios"
import url from "url"
import { parse } from "node-html-parser";
const body = new SlashCommandBuilder()
  .setName("anime")
  .setDescription("find a link to watch anime")
  .addStringOption(
    new SlashCommandStringOption()
      .setDescription("anime name")
      .setName("name")
  )
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    const name = interaction.options.getString("name", false);
    if(!name) {
      interaction.reply("you need to provide a name");
      return;
    }
    const params = new url.URLSearchParams({
      qfast: name,
    })
    const request = await axios.post(`https://cachecow.eu/api/search`, params);
    console.log(request.data);
    const dom = parse(request.data.result);
    const $lis = dom.querySelectorAll("li");
    const embed = new Embed()
      .setTitle(`Search results for ${name}`)
      .setDescription("Results...")
    $lis.forEach(($li) => {
      const $a = $li.querySelector("a");
      const $img = $li.querySelector("img");
      const image = $img?.getAttribute("src");
      const title = $a?.getAttribute("title") || "?";
      const link = $a?.getAttribute("href") || "?";
      embed.addField({
        name: title,
        value: `https://animixplay.to${link}`,
      });
    });
    interaction.reply({
      embeds: [embed]
    });
  }
}
