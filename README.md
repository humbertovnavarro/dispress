This guide assumes you have nodejs gallium (16.14.2 lts) installed. [NodeJS Homepage](https://nodejs.org/en/)
***
# Installing Dependencies
Install Yarn
> `npm install -g yarn`

Install dependencies
> `yarn`

Transpile the source code
> `yarn build`

Create a file called .env
> `touch .env`

Add your discord token to the file
> `echo "TOKEN=mydiscordtoken" > .env` (Replace mydiscordtoken with your discord token)

Start the bot
> `yarn start`

# Creating your first command
## Create a file called ping in /commands/ping
```js
/* SlashCommandBuilder is a functional way to create a slash command body,
   which is what gets sent to discord to label our slash command.
*/
import { SlashCommandBuilder } from "@discordjs/builders"
// Command interaction is a type from discord.js
import type { CommandInteraction } from "discord.js";
const body = new SlashCommandBuilder()
.setName("ping")
.setDescription("replies with pong");
export default {
 // Body is of type SlashCommandBuilder
 body,
 // Handler runs whenever a slash command is recieved.
 handler: async (interaction: CommandInteraction) => {
    interaction.reply("Pong!")
 }
 // On ready runs when the bot logs in. You can use this for any initialization code.
 onReady: (bot: Bot) => {

 }
}

```
## Add the command to your bot
```js
import bot from "./lib/client";
import ping from "./commands/ping"
bot.useCommand(ping)
bot.login("yourdiscordtoken")
```

# Creating your first plugin
Making plugins works in a similar way to making commands
heres the boilerplate for a plugin
```js
import { Bot, Plugin } from "../../lib/client"
export default {
  name: "myfirstplugin",
  version: "1.0.0",
  description: "my first plugin",
  author: "humbertovnavarro",
  // Data accessible by other plugins, you'll have to do you're own type checks
  data: {
    anythinggoes: "in here"
  },
  // Before ready runs after the bot logs in, but before it sends the slash commands.
  beforeReady: (bot: Bot) => {
    bot.plugins.forEach(plugin) => {
      console.log(plugin.name);
    }
    bot.commands.forEach(command) => {
      console.log(command.body.name);
    }
    // You can bundle commands with your plugins!
    bot.useCommand(mycoolcommand)
  },
  // Runs after commands have been posted.
  onReady: (bot: Bot) => {
    console.log("I'm ready! I'm ready! I'm ready!");
  },
  //Runs before a command is executed, call cancel to cancel its execution.
  beforeCommand: (command: Commange, interaction: CommandInteraction, cancel: () => void) => {
    if(command.body.name === "cancelme") {
      cancel();
    }
  }
}
```
