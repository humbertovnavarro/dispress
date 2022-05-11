import { Guild, User } from "discord.js";
import { GetActiveChannel } from "../player/player";

export default function userInBotChannel(user: User, guild: Guild): boolean {
    const channel = GetActiveChannel(guild);
    let match = false;
  
    channel?.members.forEach(member => {
      if (member.id === user.id) {
        match = true;
      }
    });
  
    return match;
  }