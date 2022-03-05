import { Message, MessageEmbed } from "discord.js";
const starboards: Map<string, string> = new Map();
export default function handler(message: Message) {
  const starboard = message.guild?.channels.cache.get("starboard");
  message.awaitReactions({ max: 5, time: 60000, errors: ['time'] })
    .then(collected => {
      console.log(collected);
      if(collected.size >= 5) {
        const embed = new MessageEmbed()
        .setThumbnail(message.author.avatarURL() || "")
        .setTitle(message.author.tag)
        .setDescription(message.content)
        if(starboard?.isText()) {
          starboard.send({
            embeds: [embed]
          });
        }
      }
    }).catch(err => {
      console.error(err);
    });
}
