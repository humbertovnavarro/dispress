import { Track } from "discord-player";
import { Guild } from "discord.js";
import prisma from "../../../../lib/PrismaClient";
export default async function getLikesAndDislikes(guild: Guild, track: Track) {
    const dislikes = await prisma.likes.count({
        where: {
            song: track.url,
            dislike: true
        }
    });
    const likes = await prisma.likes.count({
        where: {
            song: track.url,
            guild: guild.id,
            dislike: false
        }
    });
    return {
        likes,
        dislikes
    }
}