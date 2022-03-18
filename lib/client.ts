import { Client, CommandInteraction, Message } from "discord.js";
import type { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types";

interface Command {
  handler: (interaction: CommandInteraction) => any;
  validators?: (interaction: CommandInteraction) => any[];
  body: SlashCommandBuilder;
}

export interface Bot extends Client {
  invoke: (command: string, interaction: CommandInteraction) => void;
  useCommand: (command: Command) => void;
  useMessage: (handler: (message: Message) => void | Promise<void>) => void;
}

const slashCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
const commands = new Map<string, Command>();
const messageHandlers: Array<(message: Message) => void | Promise<void>> = [];
const rest = new REST({ version: "9" });
const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_VOICE_STATES",
    "GUILD_MESSAGE_REACTIONS",
  ],
  restTimeOffset: 0,
}) as Bot;

client.on("ready", async () => {
  if (client.token) {
    rest.setToken(client.token);
  }

  client.guilds.cache.forEach((guild) => {
    if (client.user?.id) {
      rest
        .put(Routes.applicationGuildCommands(client.user.id, guild.id), {
          body: slashCommands,
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  });

  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", (interaction) => {
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);

    if (!command) return;

    try {
      command.handler(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply("An uknown error occured");
    }
  }
});

client.on("messageCreate", (message) => {
  messageHandlers.forEach((handler) => {
    handler(message);
  });
});

client.useMessage = (
  messageHandler: (message: Message) => void | Promise<void>
) => {
  messageHandlers.push(messageHandler);
};

client.useCommand = (
  command: Command,
  validators?: (interaction: CommandInteraction) => any[]
) => {
  commands.set(command.body.name, command);
  slashCommands.push(command.body.toJSON());
};

const noop = () => {};

client.invoke = (command: string, interaction: CommandInteraction) => {
  const interactionRef: any = interaction;
  interactionRef.reply = interaction.channel?.send || noop;
  commands.get(command)?.handler(interaction);
};

export default client;
