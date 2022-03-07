import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
const body = new SlashCommandBuilder()
.setName("setrestriction")
.setDescription("constrain a channel to a regular expression.")

const arg0 = new SlashCommandStringOption()
.setName("regex")
.setDescription("Regex that channel messages must follow")
.setRequired(true);

const arg1 = new SlashCommandStringOption()
.setName("errormessage")
.setDescription("the error message that is created when a user does not follow regex.")
.setRequired(true);

body.addStringOption(arg0);
body.addStringOption(arg1);
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    const regex = interaction.options.getString("regex");
    const error = interaction.options.getString("errormessage");
    if( !regex || !error) {
      interaction.reply("something went wrong while trying to create restriction.");
      return;
    }
    try {
      await client.channelRestrictions.create({
        data: {
          regex,
          error,
          channel: interaction.channelId
        }
      })
    } catch {
      interaction.reply("something went wrong while trying to create restriction.");
      return;
    }
    interaction.reply("Restriction created. Channel is now restricted to set rule.");
  }
}
