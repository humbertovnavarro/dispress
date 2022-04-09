import { Plugin } from '../../lib/dispress';
import axios from 'axios';
import { PresenceData } from 'discord.js';
import dotenv from 'dotenv';
import DiscordBot from 'lib/dispress/DiscordBot';
import DiscordExpressBot from 'lib/dispress/DiscordExpressBot';
import { Response } from 'express';
dotenv.config();

const plugin: Plugin = {
  name: 'minecraft',
  beforeReady: (discordbot: DiscordExpressBot) => {
    const presence: PresenceData = {};
    setInterval(async () => {
      getServerStatistics(discordbot);
    }, 60000);
    discordbot.router?.get('/minecraft/v1/:guild/stats', (_, response: Response) => {
      response.redirect(`https://api.mcsrvstat.us/2/${process.env.MINECRAFT_SERVER}`);
    });
  },
  onReady: (discordbot: DiscordBot) => {
    getServerStatistics(discordbot);
  }
};
export default plugin;

const getServerStatistics = async (discordbot: DiscordBot) => {
  const resp = await axios.get(
    `https://api.mcsrvstat.us/2/${process.env.MINECRAFT_SERVER}`
  );
  const data = resp.data;
  const players:
    | {
        online: number;
        max: number;
      }
    | undefined = resp.data.players;
  if (!players || !players.online || !players.max) {
    discordbot.user?.setPresence({
      activities: [{ name: `Minecraft with 0 players :(` }],
      status: 'online'
    });
  }
  discordbot.user?.setPresence({
    activities: [
      { name: `Minecraft with ${players?.online}/${players?.max} players` }
    ],
    status: 'online'
  });
};
