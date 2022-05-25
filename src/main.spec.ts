import fs from 'fs';
import DiscordBot from './lib/dispress/DiscordBot';
import { Plugin } from './lib/dispress/dispress';
import botFactory from './main';
function getPlugins(): string[] {
  const plugins = fs.readdirSync('./src/plugins');
  return plugins;
}

describe('discordBot', () => {
  it('should have plugins in plugins folder', () => {
    const loadedPlugins = new Map<string, boolean>();
    const useCommand = jest.fn()
    const mockBot = {
      usePlugin: (plugin: Plugin) => { loadedPlugins.set(plugin.name, true)},
      useCommand: () => {}
    } as unknown as DiscordBot;
    const bot = botFactory(mockBot);
    const plugins = getPlugins();
    for(const plugin of plugins) {
      expect(loadedPlugins.get(plugin)).toBe(true);
    }
  });
});