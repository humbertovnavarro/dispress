import type { ClientOptions, Client } from 'discord.js';

export interface SlashCommandBody {
  toJSON: () => RESTPostAPIApplicationCommandsJSONBody;
  name: string;
  description: string;
  options: any;
}

export interface Command<CommandContext = unknown> {
  handler: (interaction: CommandInteraction) => unknown;
  body: SlashCommandBody;
  /**
   * Command lifecycle method that is called when the bot logs in to discord
   */
  onReady?: (bot: Bot) => unknown;
  /**
   * Any state that the command wants to share with other commands and plugins
   */
  context?: CommandContext;
}

type BeforeCommandCallback = (
  command: Command,
  interaction: CommandInteraction,
  /**
   * Cancels execution of the command
   */
  cancel: () => void
) => void;

export interface Plugin<PluginContext = unknown> {
  name: string;
  /**
   * Plugin lifecycle method that is called when the bot logs in to discord
   */
  onReady?: (bot: Bot) => unknown;
  /**
   * Plugin lifecycle method that is called before the bot logs in to discord
   */
  beforeReady?: (bot: Bot) => unknown;
  /**
   * Plugin lifecycle method that is called before a command should be executed
   */
  beforeCommand?: BeforeCommandCallback;
  /**
   * Any state that the plugin wants to share with other plugins and commands
   */
  context?: PluginContext;
}

export interface Bot extends Client {
  getCommand: (command: string) => Command | void;
  getPlugin: (command: string) => Plugin | void;
  usePlugin: (plugin: Plugin) => void;
  invoke: (command: string, interaction: CommandInteraction) => void;
  useCommand: (command: Command) => void;
  useMessage: (handler: (message: Message) => void | Promise<void>) => void;
  commands: Map<string, Command>;
  plugins: Map<string, Plugin>;
  prefix: string;
}

export interface BotOptions extends ClientOptions {
  prefix?: string;
}

export interface QueueMeta {
  channel: TextChannel;
}

export interface TrackMeta {
  query: string;
}
