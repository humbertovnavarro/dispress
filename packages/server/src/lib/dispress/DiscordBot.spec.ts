import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Plugin } from '../dispress';
import clientClass from './DiscordBot';
const client = new clientClass({
  intents: []
});
const plugin = {
  name: 'bad plugin',
  onReady: jest.fn(() => {
    throw new Error();
  }),
  beforeReady: jest.fn(() => {})
} as unknown as Plugin;
const command = {
  body: new SlashCommandBuilder()
    .setName('error')
    .setDescription('throws an error'),
  handler: (interaction: CommandInteraction) => {
    throw new Error();
  }
};
describe('client tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  test('Imports without crashing', () => {
    expect(client).toBeTruthy();
  });
  test('Handles crashing commands', () => {
    client.useCommand(command);
    const reply = jest.fn();
    const interaction = {
      isCommand: () => true,
      commandName: 'error',
      reply
    } as unknown as CommandInteraction;
    client.emit('interactionCreate', interaction);
    expect(reply).toBeCalledWith('An uknown error occured');
  });
  test('Handles crashing plugins', () => {
    client.usePlugin(plugin);
    expect(plugin.beforeReady).toHaveBeenCalledWith(client);
    client.emit('ready', null);
    expect(plugin.onReady).toBeCalledWith(client);
  });
  test('Grabs plugins', () => {
    expect(client.getPlugin('bad plugin')).toBe(plugin);
  });
  test('Grabs commands', () => {
    expect(client.getCommand('error')).toBe(command);
  });
});
