import {
  Embed,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import { CommandInteraction, Guild, GuildMember, Message } from "discord.js";
import { Command } from "../../lib/dispress/dispress";
import fs from "fs";
import path from "path";
interface UserKeyWordMap {
  [key: string]: string[];
}
interface GuildKeyWordMap {
  [key: string]: UserKeyWordMap;
}

if (!fs.existsSync(path.resolve(process.cwd(), "keywords.json"))) {
  fs.writeFileSync(path.resolve(process.cwd(), "keywords.json"), "{}");
}

const guildKeyWordMap: GuildKeyWordMap = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "keywords.json"), "utf-8")
);

setInterval(() => {
  try {
    fs.writeFileSync(
      path.resolve(process.cwd(), "keywords.json"),
      JSON.stringify(guildKeyWordMap)
    );
  } catch (e) {
    console.log(e);
  }
}, 1000);

export const handler = (message: Message) => {
  const guild = message.guild;
  if (!guild) return;
  const keyWords = guildKeyWordMap[guild.id];
  if (!keyWords) return;
  for (const word of Object.keys(keyWords)) {
    if (message.content.toLowerCase().includes(word)) {
      const users = keyWords[word];
      for (const user of users) {
        const realUser = guild.members.cache.get(user);
        if (realUser) notify(realUser, message);
      }
    }
  }
};

const addKeyWord = (guild: Guild, word: string, user: GuildMember) => {
  if (!guildKeyWordMap[guild.id]) {
    guildKeyWordMap[guild.id] = {};
  }
  if (!guildKeyWordMap[guild.id][word]) {
    guildKeyWordMap[guild.id][word] = [user.id];
    return;
  }
  if (guildKeyWordMap[guild.id][word].includes(user.id)) {
    return;
  }
  guildKeyWordMap[guild.id][word].push(user.id);
};

const deleteKeyWord = (guild: Guild, word: string, user: GuildMember) => {
  if (!guildKeyWordMap[guild.id]) return;
  if (!guildKeyWordMap[guild.id][word]) return;
  const index = guildKeyWordMap[guild.id][word].indexOf(user.id);
  if (index === -1) return;
  guildKeyWordMap[guild.id][word].splice(index, 1);
};

async function notify(user: GuildMember, message: Message) {
  if (user.user.id === message.author.id) return;
  if (message.author.bot) return;
  const dmChannel = await user.createDM();
  const embed = new Embed()
    .setTitle("Hey! One of your key phrases triggered.")
    .setThumbnail(message.author.avatarURL())
    .setDescription(`\`${message.content}\``)
    .setTimestamp(message.createdTimestamp)
    .addField({
      name: "Channel",
      value: message.channel.toString(),
    })
    .addField({
      name: "Guild",
      value: message.guild?.toString() || "guild",
    });
  await dmChannel.send({
    embeds: [embed],
  });
}

export const addPhrase: Command = {
  body: new SlashCommandBuilder()
    .setName("addphrase")
    .setDescription("Adds a phrase to your list of phrases.")
    .addStringOption(
      new SlashCommandStringOption()
        .setRequired(true)
        .setName("phrase")
        .setDescription("The phrase to add.")
    ),
  handler: async (interaction: CommandInteraction) => {
    const guild = interaction.guild;
    if (!guild) return;
    const user = interaction.user;
    const member = guild.members.cache.get(user.id);
    if (!member) return;
    const word = interaction.options.getString("phrase");
    if (!word) return;
    addKeyWord(guild, word, member);
    interaction.reply("OK");
  },
};

export const deletePhrase: Command = {
  body: new SlashCommandBuilder()
    .setName("deletephrase")
    .setDescription("Delete a phrase to your list of phrases.")
    .addStringOption(
      new SlashCommandStringOption()
        .setRequired(true)
        .setName("phrase")
        .setDescription("The phrase to delete.")
    ),
  handler: async (interaction: CommandInteraction) => {
    const guild = interaction.guild;
    if (!guild) return;
    const user = interaction.user;
    const member = guild.members.cache.get(user.id);
    if (!member) return;
    const word = interaction.options.getString("phrase");
    if (!word) return;
    deleteKeyWord(guild, word, member);
    interaction.reply("OK");
  },
};
