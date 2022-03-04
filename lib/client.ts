import {
  Client,
  DMChannel,
  Guild,
  Intents,
  Message,
  NewsChannel,
  PartialDMChannel,
  TextChannel,
  ThreadChannel,
  User,
} from "discord.js";
import rateLimit from "./processors/rate-limit";
interface Command {
  name: string;
  aliases?: string[];
  description: string;
  handler: MessageProcessor;
}

export interface MessageWrapper {
  message: Message;
  args: string[];
  cancel: () => void;
  command?: Command;
  channel:
    | DMChannel
    | PartialDMChannel
    | NewsChannel
    | TextChannel
    | ThreadChannel;
  author: User;
  guild?: Guild | null;
}

export type MessageProcessor = (message: MessageWrapper) => void;

export default class DiscordBot {
  prefix: string = "!";
  commandsUnique: Command[] = [];
  commands: Map<string, Command> = new Map();
  processors: Map<string, MessageProcessor[]> = new Map();
  client: Client;

  constructor(prefix: string) {
    this.prefix = prefix;
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILDS,
      ],
    });
    this.client.on("ready", () => {
      console.log("connected!");
    });
    this.useCommandHandler();
    this.useProcessor("pre_command", rateLimit);
  }

  login(token: string) {
    this.client.login(token);
  }

  use(command: Command) {
    this.commandsUnique.push(command);
    command.aliases?.forEach((alias) => {
      this.commands.set(alias, command);
    });
    this.commands.set(command.name, command);
  }

  useProcessor(
    name: "pre" | "pre_command" | "post_error" | "post_success" | "post",
    callback: MessageProcessor
  ) {
    if (this.processors.has(name)) {
      this.processors.get(name)?.push(callback);
    } else {
      this.processors.set(name, [callback]);
    }
  }

  private useCommandHandler() {
    this.client.on("messageCreate", (message) => {
      let cancelled = false;
      const cancelFunction = () => (cancelled = !cancelled);
      const messageWrapper: MessageWrapper = {
        message,
        args: [],
        cancel: cancelFunction,
        guild: message.guild,
        channel: message.channel,
        author: message.author,
      };
      let processors = this.processors.get("pre");
      processors?.forEach((processor) => {
        processor(messageWrapper);
      });
      if (cancelled) {
        return;
      }
      if (!message.content.startsWith(this.prefix)) {
        return;
      }
      const args = message.content.split(" ");
      args[0] = args[0].substring(this.prefix.length);
      messageWrapper.args = args;
      const command = this.commands.get(args[0]);
      if (command) {
        messageWrapper.command = command;
        this.processors.get("pre_command")?.forEach((processor) => {
          processor(messageWrapper);
        });
        this.processors.get(args[0])?.forEach((processor) => {
          processor(messageWrapper);
        });
      }
      if (cancelled) {
        return;
      }
      let didError = false;
      try {
        command?.handler(messageWrapper);
      } catch (error) {
        didError = true;
        this.processors.get(`post_error`)?.forEach((processor) => {
          processor(messageWrapper);
        });
      }
      if (!didError) {
        this.processors.get(`post_success`)?.forEach((processor) => {
          processor(messageWrapper);
        });
      }
      this.processors.get(`post`)?.forEach((processor) => {
        processor(messageWrapper);
      });
    });
  }
}
