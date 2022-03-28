import { Client, CommandInteraction, Interaction, Message } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types';

interface SlashCommandBuilder {
  toJSON(): RESTPostAPIApplicationCommandsJSONBody;
  [key: string]: any;
}

export interface Command {
  handler: (interaction: CommandInteraction) => any;
  body: SlashCommandBuilder;
  onReady?: (bot: Bot) => any;
  data?: {
    [key: string]: any;
  };
}

type BeforeCommandCallback = (
  command: Command,
  interaction: CommandInteraction,
  cancel: () => void
) => void;

export interface Plugin {
  name: string;
  onReady?: (bot: Bot) => any;
  beforeReady?: (bot: Bot) => any;
  beforeCommand?: BeforeCommandCallback;
  data?: {
    [key: string]: any;
    permissions?: string[];
  };
}

export interface Bot extends Client {
  usePlugin: (plugin: Plugin) => void;
  invoke: (command: string, interaction: CommandInteraction) => void;
  useCommand: (command: Command) => void;
  useMessage: (handler: (message: Message) => void | Promise<void>) => void;
  commands: Map<string, Command>;
  plugins: Map<string, Plugin>;
  prefix: string;
}

const slashCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
const commands = new Map<string, Command>();
const plugins = new Map<string, Plugin>();
const messageHandlers: Array<(message: Message) => void | Promise<void>> = [];
const rest = new REST({ version: '9' });
const client = new Client({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
    'GUILD_MESSAGE_REACTIONS'
  ],
  restTimeOffset: 0
}) as Bot;
client.plugins = plugins;
client.commands = commands;

client.on('ready', async () => {
  plugins.forEach(plugin => {
    try {
      plugin.onReady?.(client);
    } catch (error) {
      console.error(error);
      console.error(`Error while running plugin: ${plugin.name}`);
    }
  });
  if (client.token) rest.setToken(client.token);
  client.guilds.cache.forEach(guild => {
    if (client.user?.id)
      rest
        .put(Routes.applicationGuildCommands(client.user.id, guild.id), {
          body: slashCommands
        })
        .catch(error => {
          console.error(error.message);
        });
  });
  client.commands.forEach(command => {
    try {
      command.onReady?.(client);
    } catch (error) {
      console.error(error);
      console.error(
        `Error while running ready function for command: ${command.body.name}`
      );
    }
  });
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('guildCreate', guild => {
  if (client.token) rest.setToken(client.token);
  client.guilds.cache.forEach(guild => {
    if (client.user?.id)
      rest
        .put(Routes.applicationGuildCommands(client.user.id, guild.id), {
          body: slashCommands
        })
        .catch(error => {
          console.error(error.message);
        });
  });
});

client.on('interactionCreate', interaction => {
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;
    if (interaction.replied) return;
    try {
      let cancelled = false;
      const cancelFunction = () => {
        console.log('Cancelled');
        cancelled = true;
      };
      plugins.forEach(plugin => {
        plugin.beforeCommand?.(command, interaction, cancelFunction);
      });
      if (cancelled) return;
      command.handler(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply('An uknown error occured');
    }
  }
});

client.on('messageCreate', message => {
  messageHandlers.forEach(handler => {
    handler(message);
  });
});

client.useMessage = (
  messageHandler: (message: Message) => void | Promise<void>
) => {
  messageHandlers.push(messageHandler);
};

client.useCommand = (command: Command) => {
  commands.set(command.body.name, command);
  slashCommands.push(command.body.toJSON());
};

client.usePlugin = (plugin: Plugin) => {
  try {
    plugin.beforeReady?.(client);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  plugins.set(plugin.name, plugin);
};

client.invoke = (command: string, interaction: CommandInteraction) => {
  commands.get(command)?.handler(interaction);
};

export default client;