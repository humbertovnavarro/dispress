import { Plugin } from '../../lib/dispress/dispress';
import DiscordBot from '../../lib/dispress/DiscordBot';
import { Message } from 'discord.js';
import SimpleCommand from './SimpleCommand';
import { getConfig } from '../../lib/config';
const commands: Map<string, SimpleCommand> = new Map<string, SimpleCommand>();
let prefix: string = getConfig('dispress.prefix');

interface SimpleCommandParserContext {
  useCommand: (command: SimpleCommand) => void;
}

const plugin: Plugin<SimpleCommandParserContext> = {
  name: 'simplecommandparser',
  onReady: (bot: DiscordBot) => {
    bot.on('messageCreate', async (message: Message) => {
      if (!message.content.startsWith(prefix)) return;
      const args = message.content.trim().split(' ');
      if (args.length < 1) return;
      const command = commands.get(args[0]);
      try {
        await command?.handler(message, args, prefix);
      } catch (error) {
        console.error(error);
        message.channel.send(
          'An unknown error occured while running that command.'
        );
      }
    });
  },
  context: {
    useCommand(command: SimpleCommand) {
      commands.set(`${prefix}${command.name}`, command);
      command.aliases?.forEach(alias => {
        commands.set(`${prefix}${alias}`, command);
      });
    }
  }
};
export default plugin;
