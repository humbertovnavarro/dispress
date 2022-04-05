import { Plugin } from '../../lib/dispress';
import pause from './commands/pause';
import queue from './commands/queue';
import unpause from './commands/unpause';
import guildplaylist from './commands/guildplaylist';
import play from './commands/play';
import stop from './commands/stop';
import skip from './commands/skip';
import summon from './commands/summon';
import filters from './commands/filters';
import DiscordExpressBot from 'lib/dispress/DiscordExpressBot';
import { Request, Response } from 'express';
import { UsePlayer } from './helpers/player';
import searchForTrack from './helpers/searchForTrack';
const plugin: Plugin = {
  name: 'musicbot',
  beforeReady: (bot: DiscordExpressBot) => {
    bot.useCommand(pause);
    bot.useCommand(play);
    bot.useCommand(stop);
    bot.useCommand(skip);
    bot.useCommand(queue);
    bot.useCommand(guildplaylist);
    bot.useCommand(unpause);
    bot.useCommand(filters);
    bot.useCommand(summon);
    // Expose the player as an API
    bot.router?.get("/musicbot/v1/:guild/queue" , (request: Request, response: Response) => {
      const guild = bot.guilds.cache.get(request.params.guild);
      if(!guild) return response.status(404).json({
        error: "guild not found"
      });
      const player = UsePlayer(bot);
      if(!player) return response.status(500).json({
        error: "an unexpected error occured"
      });
      const queue = player.getQueue(guild);
      if(!queue) return response.status(404).json({
        error: "no guild queue found"
      });
      const payload = {
        previous: queue.previousTracks,
        next: queue.tracks,
        current: queue.current,
      }
      return response.json(payload);
    });
    bot.router?.post("/musicbot/v1/:guild/queue/enqueue" , async (request: Request, response: Response) => {
      const guild = bot.guilds.cache.get(request.params.guild);
      const trackQuery = request.body.track;
      const userId = request.body.user;
      const channelId = request.body.channel;
      const channel = guild?.channels.cache.get(channelId);
      if(!userId) return response.status(400).json({
        error: "user id not provided"
      });
      const user = bot.users.cache.get(userId);
      if(!user) return response.status(400).json({
        error: "user not found"
      });
      if(!trackQuery) return response.status(400).json({
        error: "no track provided"
      });
      if(!guild) return response.status(404).json({
        error: "guild not found"
      });
      const player = UsePlayer(bot);
      if(!player) return response.status(500).json({
        error: "an unexpected error occured"
      });
      let queue = player.getQueue(guild);
      if(!queue) {
        if(!channel) return response.status(400).json({
          error: "Bot needs to be summoned in a voice channel"
        });
      }
      const track = await searchForTrack(trackQuery, user, player);
      if(!track) return response.status(404).json({
        error: "no track found"
      });
      queue.addTrack(track);
      const payload = {
        previous: queue.previousTracks,
        next: queue.tracks,
        current: queue.current,
      }
      if(!queue.playing) queue.play();
      return response.json(payload);
    });
  }
};
export default plugin;
