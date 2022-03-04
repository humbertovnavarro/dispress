import { MessageWrapper } from "../client";
const cooldowns: Map<string, NodeJS.Timer> = new Map();
const COOLDOWN = 100;
export default function rateLimit(message: MessageWrapper) {
    const id = message.author.id;
    if(cooldowns.has(id)){
        message.cancel();
    } else {
        cooldowns.set(id, setInterval(() => {
            cooldowns.delete(id);
        }, COOLDOWN))
    }
}