import {
  Client as DiscordClient,
  CommandInteraction,
  Guild,
  Interaction,
  Message
} from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import { BotOptions, Command, Plugin } from './dispress';

export default class DiscordBot extends DiscordClient {
  prefix: string = '!';
  slashCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  commands = new Map<string, Command>();
  plugins = new Map<string, Plugin>();
  messageHandlers: Array<(message: Message) => unknown> = [];
  slashCommandRest = new REST({ version: '9' });

  constructor(options: BotOptions) {
    super(options);
    this.on('ready', this.ready);
    this.on('guildCreate', this.guildCreate);
    this.on('interactionCreate', this.interactionCreate);
    this.on('messageCreate', this.messageCreate);
    if (options.prefix) {
      this.prefix = options.prefix;
    }
  }
  async login(token?: string | undefined) {
    return super.login(token);
  }
  private async triggerPluginOnReady() {
    this.plugins.forEach(plugin => {
      try {
        plugin.onReady?.(this);
      } catch (error) {
        console.error(error);
        console.error(`Error while running plugin: ${plugin.name}`);
      }
    });
  }
  private async triggerCommandOnReady() {
    this.commands.forEach(command => {
      try {
        command.onReady?.(this);
      } catch (error) {
        console.error(error);
        console.error(
          `Error while running ready function for command: ${command.body.name}`
        );
      }
    });
  }
  private async postSlashCommands() {
    if (this.token) {
      this.slashCommandRest.setToken(this.token);
    } else {
      console.error(
        "Client token missing after logging in, I hope you're testing or something went horribly wrong."
      );
    }
    this.guilds.cache.forEach(guild => {
      if (this.user?.id)
        this.slashCommandRest
          .put(Routes.applicationGuildCommands(this.user.id, guild.id), {
            body: this.slashCommands
          })
          .catch(error => {
            switch (guild.name) {
              case 'guild':
                return;
              case '1234512':
                return;
            }
            console.error(
              `Could not update slash commands for guild ${guild.name}, caused by "${error.message}"`
            );
          });
    });
  }
  private async triggerLoadedCallbacks() {
    const commandsArray = Array.from(this.commands.values());
    const pluginsArray = Array.from(this.plugins.values());
    this.plugins.forEach((plugin: Plugin) => {
      if(plugin.onPluginsLoaded) {
        plugin.onPluginsLoaded(pluginsArray);
      }
      if(plugin.onCommandsLoaded) {
        plugin.onCommandsLoaded(commandsArray);
      }
    });
  }
  private async ready() {
    const onCommandsLoadedCallbacks: Array<(commands: Command[]) => unknown> = [];
    const onPluginsLoadedCallbacks: Array<(plugins: Plugin[]) => unknown> = [];
    this.triggerPluginOnReady();
    this.postSlashCommands();
    this.triggerCommandOnReady();
    this.triggerLoadedCallbacks();
  }

  private async guildCreate(guild: Guild) {
    const client = this;
    const rest = this.slashCommandRest;
    if (client.token) rest.setToken(client.token);
    client.guilds.cache.forEach(guild => {
      if (client.user?.id)
        rest
          .put(Routes.applicationGuildCommands(client.user.id, guild.id), {
            body: this.slashCommands
          })
          .catch(error => {
            console.error(error.message);
          });
    });
  }

  private interactionCreate(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    const command = this.commands.get(interaction.commandName);
    if (!command || interaction.replied) return;
    try {
      let cancelled = false;
      const cancelFunction = () => {
        cancelled = true;
      };
      this.plugins.forEach(plugin => {
        plugin.beforeCommand?.(command, interaction, cancelFunction);
      });
      if (cancelled) return;
      command.handler(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply('An uknown error occured');
    }
  }

  private messageCreate(message: Message) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error(error);
      }
    });
  }

  public getCommand(command: string): Command | undefined {
    return this.commands.get(command);
  }

  public getPlugin(plugin: string): Plugin | undefined {
    return this.plugins.get(plugin);
  }
  /**
   * Returns the context of the command (Read only) or undefined if the command is not registered
   */
  public useCommandContext<ContextType>(
    command: string
  ): Command<ContextType> | undefined {
    const commandReference = this.commands.get(command);
    if (!commandReference) return undefined;
    const pureCommand = {
      ...commandReference
    };
    Object.freeze(pureCommand);
    return pureCommand as Command<ContextType>;
  }
  /**
   * Returns the context of a plugin (Read only) or undefined if the plugin is not registered
   */
  public usePluginContext<ContextType>(
    command: string
  ): Plugin<ContextType> | undefined {
    const commandReference = this.plugins.get(command);
    if (!commandReference) return undefined;
    const pureCommand = {
      ...commandReference
    };
    Object.freeze(pureCommand);
    return pureCommand as Plugin<ContextType>;
  }

  /**
   * usePlugin injects a Plugin into the bot.
   */
  public usePlugin(plugin: Plugin) {
    try {
      plugin.beforeReady?.(this);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    this.plugins.set(plugin.name, plugin);
  }
  /**
   * Invoke calls a command with a CommandInteraction, useful for chaining commands.
   */
  public invoke(command: string, interaction: CommandInteraction) {
    this.commands.get(command)?.handler(interaction);
  }
  /**
   * useCommand injects a command into the bot
   */
  public useCommand(command: Command) {
    this.commands.set(command.body.name, command);
    this.slashCommands.push(command.body.toJSON());
  }
  /**
   * useMessage adds a message handler that gets invoked on every message the bot recieves
   */
  public useMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
  }
}
