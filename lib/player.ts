import { Player } from "discord-player";
import { Client } from "discord.js";

let player: Player;


export function UsePlayer(client: Client): Player {
    const newPlayer = new Player(client);
    newPlayer.on("trackStart", (queue: any, track) => queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`))
    player = newPlayer;
    return player;
}
