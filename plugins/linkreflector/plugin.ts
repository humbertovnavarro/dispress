import { Embed } from '@discordjs/builders';
import { Guild, Message, TextChannel } from 'discord.js';
import { Bot, Plugin } from '../../lib/client';
import db from '../../lib/query/db';
const reflectorChannels = new Map<string, TextChannel>();
const plugin: Plugin = {
  name: 'linkreflector',
  beforeReady: (bot: Bot) => {
    initializeDatabase();
    bot.on('messageCreate', handleMessage);
  },
  onReady: async (bot: Bot) => {
    await loadChannels(bot);
  }
};

export function isLink(message: string): boolean {
  return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g.test(
    message
  );
}

async function handleMessage(message: Message) {
  const bot = message.client as Bot;
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.content.startsWith(`${bot.prefix}seturlreflector`)) {
    const member = message.member;
    if (!member) return;
    if (!member.permissions.has('MANAGE_GUILD')) {
      message.reply("You don't have permission to use this command");
      return;
    }
    const channel = message.channel as TextChannel;
    reflectorChannels.set(message.guild.id, channel);
    setReflectorChannel(message.guild, channel);
    message.reply('I will now reflect links in this channel');
  }
  if (!reflectorChannels.has(message.guild.id)) return;
  if (isLink(message.content)) {
    const channel = reflectorChannels.get(message.guild.id);
    if (channel) {
      const embed = new Embed()
        .setTitle(`Posted by ${message.author.username}`)
        .setThumbnail(message.author.displayAvatarURL())
      try {
        await channel.send({ embeds: [embed] });
        await channel.send(message.content);
      } catch (e) {
        console.error(e);
        reflectorChannels.delete(message.guild.id);
        deleteReflectorChannel(message.guild);
      }
    }
  }
}

function initializeDatabase() {
  db.exec(
    `
      CREATE TABLE IF NOT EXISTS LinkReflectorChannels (
        guildId TEXT NOT NULL,
        channelId TEXT NOT NULL,
        PRIMARY KEY (guildId)
      );
    `
  );
}

const setReflectorChannel = (guild: Guild, channel: TextChannel) => {
  deleteReflectorChannel(guild);
  db.prepare(
    `
    INSERT INTO LinkReflectorChannels (guildId, channelId)
    VALUES (?, ?);
  `
  ).run(guild.id, channel.id);
};

const deleteReflectorChannel = (guild: Guild) => {
  db.prepare(
    `
    DELETE FROM LinkReflectorChannels
    WHERE guildId = ?;
  `
  ).run(guild.id);
};

async function loadChannels(bot: Bot) {
  const promises = db
    .prepare(
      `
      SELECT * FROM LinkReflectorChannels;
    `
    )
    .all()
    .map(async row => {
      const guild = await bot.guilds.fetch(row.guildId);
      if (guild) {
        const channel = await guild.channels.fetch(row.channelId);
        if (channel) {
          reflectorChannels.set(guild.id, channel as TextChannel);
        }
      }
    });
  await Promise.all(promises);
}
export default plugin;
