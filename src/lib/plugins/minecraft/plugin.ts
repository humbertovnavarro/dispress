import { Bot, Plugin } from '../../dispress';
import axios from 'axios';
import { PresenceData } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const plugin: Plugin = {
  name: 'minecraft',
  beforeReady: (bot: Bot) => {
    const presence: PresenceData = {};
    setInterval(async () => {
      getServerStatistics(bot);
    }, 60000);
  },
  onReady: (bot: Bot) => {
    getServerStatistics(bot);
  }
};
export default plugin;

const getServerStatistics = async (bot: Bot) => {
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
    bot.user?.setPresence({
      activities: [{ name: `Minecraft with 0 players :(` }],
      status: 'online'
    });
  }
  bot.user?.setPresence({
    activities: [
      { name: `Minecraft with ${players?.online}/${players?.max} players` }
    ],
    status: 'online'
  });
};
