import { Message, MessageEmbed } from "discord.js";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
interface Restriction {
  regex: RegExp;
  error: string;
}
const cache: Map<string, Restriction> = new Map();
export default async function handler(message: Message) {
  if(message.author.bot) return;
  if(!message.channel.id) return;
  let error: string;
  let regex: RegExp;
  if(cache.has(message.channel.id)) {
    const cachedCopy = cache.get(message.channelId);
    if(!cachedCopy) {
      return;
    }
    regex = cachedCopy.regex;
    error = cachedCopy.error;
  } else {
    try {
      const restriction = await prisma.channelRestrictions.findUnique({
        where: {
          channel: message.channel.id
        }
      });
      if(restriction && restriction.regex) {
        const dbRegex = new RegExp(restriction.regex)
        cache.set(message.channel.id, { error: restriction.error, regex: dbRegex });
        regex = dbRegex;
        error = restriction.error;
      } else {
        return;
      }
    } catch {
      return;
    }
  }
  if(!message.content.match(regex)) {
    const warning = await message.channel.send(error);
    setTimeout(() => {
      try {
        if(warning.deletable)
        warning.delete();
        if(message.deletable)
        message.delete();
      } catch(error) {
        console.error(error);
      }
    }, 5000)
  }
}
