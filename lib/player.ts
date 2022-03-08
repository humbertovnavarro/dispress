import { Player, Queue, Track } from "discord-player";
import { Client, Collection, CommandInteraction, Guild, Message, MessageEmbed, TextChannel, User, VoiceBasedChannel } from "discord.js";
import { Reverbnation, Lyrics } from "@discord-player/extractor";
import { LyricsData } from "@discord-player/extractor/lib/ext/Lyrics";
import db from './prisma';
interface LyricsClient {
    search: (query: string) => Promise<LyricsData>;
    client: any
}
let lyricsClient: LyricsClient;
let player: Player | undefined;

export function UsePlayer(client: Client): Player {
    if(player) return player;
    player = new Player(client);
    lyricsClient = Lyrics.init();
    player.use("reverbnation", Reverbnation)
    player.on("trackStart", trackStart)
    return player;
}

export function GetActiveChannel (guild: Guild): VoiceBasedChannel | undefined {
    const id = player?.client.user?.id;
    if(!id) return;
    const member = guild.members.cache.get(id);
    if(!member) return;
    return member.voice.channel || undefined;
}

export const trackStart = async (queue: Queue, track: Track) => {
    const queueRef = queue as any;
    const channel = queueRef.metadata.channel as TextChannel;
    if(!channel) return;
    let { title, thumbnail, url, author} = track;
    author = `uploaded by ${author}`;
    let avatar: string = track.requestedBy.avatarURL() || track.requestedBy.defaultAvatarURL;
    const embed = new MessageEmbed()
    .setTitle(`${title}`)
    .setThumbnail(avatar)
    .setDescription(author)
    .setImage(thumbnail)
    .setURL(url)
    .setColor("DARK_RED")
    .setFooter(track.duration)
    .addField("requested by", track.requestedBy.tag);
    let message: Message;
    try {
        message = await channel.send({embeds: [embed]}) as Message;
    } catch { 
        return;
    }
    message.react('⏸️')
    message.react('▶️')
    message.react('🛑')
    message.react('❤️')
    message.react('😒')
    message.react('😒')
    message.react('📖')
    const collector = message.createReactionCollector({time: 200000})
    const likeMap = new Collection();
    let openedLyrics = false;
    collector.on("collect", (reaction, user) => {
      if(!message.guild) return;
      if(user.bot) return;
      if(!(reaction.emoji.name === '⏸️' || reaction.emoji.name === '🛑' || reaction.emoji.name === '▶️' || reaction.emoji.name === '⏭️' || reaction.emoji.name === '❤️' || reaction.emoji.name === '😒' || reaction.emoji.name === '📖')) {
          return;
      }
      if(!userInBotChannel(user, message.guild)) {
          return;
      }
      if(reaction.emoji.name === '⏸️') {
        queue.setPaused(true);
      }
      if(reaction.emoji.name === '▶️') {
        queue.setPaused(false);
      }
      if(reaction.emoji.name === '⏭️') {
        queue.skip();
      }
      if(reaction.emoji.name === '🛑') {
        player?.deleteQueue(message.guild);
      }
      if(reaction.emoji.name === '❤️') {
          if(!likeMap.has(user.id))
          addLike(user, track);
          likeMap.set(user.id, true);
      }
      if(reaction.emoji.name === '😒') {
          if(!likeMap.has(user.id))
          addDislike(user, track);
          likeMap.set(user.id,true);
      }
      if(reaction.emoji.name === '📖') {
          if(openedLyrics) return;
          postLyrics(channel, track)
          openedLyrics = true;
      }
      if(!(reaction.emoji.name === '❤️' || reaction.emoji.name === '😒')) 
      reaction.users.remove(user);
    })
}
export function userInBotChannel(user: User, guild: Guild): boolean {
    const channel = GetActiveChannel(guild);
    let match = false;
    channel?.members.forEach(member => {
        if(member.id === user.id) {
            match = true;
        }
    })
    return match;
}

async function postLyrics(channel: TextChannel, track: any) {
    let lyrics: string | undefined;
    let foundLyrics = false;
    try {
        let res = await lyricsClient.search(track.title);
        if(res.lyrics)
        lyrics = res.lyrics;
        foundLyrics = true;
    } catch {
        try {
            let res = await lyricsClient.search(track.query);
            if(res.lyrics)
            lyrics = res.lyrics;
            foundLyrics = true;
        } catch (error) {
            console.warn(error);
            return;
        }
    }
    if(!lyrics) return;
    lyrics = "\n" + "Lyrics: " + "\n\n" + lyrics;
    return channel.send(lyrics.slice(0,2000));
}

async function addLike(user: User, track: Track) {
    try {
        db.songLikes.create({
            data: {
                user: user.id,
                url: track.url,
            }
        })
    } catch (error) {
        console.error(error)
    }
}
async function addDislike(user: User, track: Track) {
    try {
        db.songLikes.create({
            data: {
                user: user.id,
                url: track.url,
            }
        })
    } catch(error) {
        console.error(error);
    }
}
