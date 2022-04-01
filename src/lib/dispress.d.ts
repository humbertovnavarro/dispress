import type { ClientOptions, Client } from "discord.js";

export interface SlashCommandBody {
  toJSON: () => RESTPostAPIApplicationCommandsJSONBody;
  name: string;
  description: string;
  options: any;
}

export interface Command<CommandContext = unknown> {
  handler: (interaction: CommandInteraction) => unknown;
  body: SlashCommandBody;
  onReady?: (bot: Bot) => unknown;
  context?: CommandContext;
}

type BeforeCommandCallback = (
  command: Command,
  interaction: CommandInteraction,
  cancel: () => void
) => void;

export interface Plugin<PluginContext = unknown> {
  name: string;
  onReady?: (bot: Bot) => unknown;
  beforeReady?: (bot: Bot) => unknown;
  beforeCommand?: BeforeCommandCallback;
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
  prefix?: string
}
