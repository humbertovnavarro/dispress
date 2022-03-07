import { Player, Track } from "discord-player";
import { Client, Guild, MessageEmbed, TextChannel, User, VoiceBasedChannel } from "discord.js";
import { Reverbnation, Lyrics } from "@discord-player/extractor";
import { LyricsData } from "@discord-player/extractor/lib/ext/Lyrics";
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

export function GetActiveChannel(guild: Guild): VoiceBasedChannel | undefined {
    const id = player?.client.user?.id;
    if(!id) return;
    const member = guild.members.cache.get(id);
    if(!member) return;
    return member.voice.channel || undefined;
}

const trackStart = async (queue: any, track: Track) => {
    const channel = queue.metadata.channel as TextChannel;
    if(!channel) return;
    let { title, thumbnail, url} = track;
    let lyrics;
    let avatar = track.requestedBy.avatar || track.requestedBy.defaultAvatarURL;
    try {
        const res = await lyricsClient.search(title);
        if(!thumbnail) thumbnail = res.thumbnail;
        title = `${res.title} by ${res.artist.name}`
        avatar = res.artist.image;
        lyrics = res.lyrics;
    } catch {}
    const embed = new MessageEmbed()
    .setTitle(`\`${title}\``)
    .setThumbnail(avatar)
    .setImage(thumbnail)
    .setURL(url)
    if(lyrics) embed.addField("Lyrics", lyrics)
    queue.metadata.channel.send({
        embeds: [embed]
    });
}
