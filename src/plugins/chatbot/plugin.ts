import { Plugin } from '../../lib/dispress';
import DiscordBot from '../../lib/dispress/DiscordBot';
import { Configuration, OpenAIApi } from "openai";
import { Message, User, Util } from 'discord.js';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});


const openai = new OpenAIApi(configuration);
const plugin: Plugin = {
    name: "chatbot",
    onReady: (bot: DiscordBot) => {
        const uid = bot.user?.id;
        if(!uid) return;
        bot.on("messageCreate", async (message: Message) => {
            const doAiReply = Math.random() > 0.96 || message.content.toLowerCase().includes("patrick")
            if(doAiReply) {
                try {
                    const reply = await AiReply(message);
                    if(reply) {
                        message.channel.send(reply);
                    }
                } catch(error) {
                    console.error(error);
                }
            }
        });
    }
}

const conversations = new Map<User, string>();

async function AiReply(message: Message): Promise<string | void> {
    const content = Util.cleanContent(message.content, message.channel);
    const previous = conversations.get(message.author);
    let newContent = `Human: ${content}\n\n`;
    if(previous) newContent = previous + newContent;
    const prompt = 
`
The following is a conversation with an AI assistant. The assistant talks in a southern accent.

Human: Hello, who are you?

AI: Howdy partner, I'm the assistant around these parts. Who might you be?

Human: My name is ${message.author.username}

${newContent}
`;
    const completion = await openai.createCompletion("text-davinci-002", {
        prompt,
        temperature: 0.6,
        max_tokens: 150
      });
    const choice = completion.data.choices?.at(0);
    if(!choice) return;
    const reply = choice.text;
    if(!reply) return;
    newContent += reply + "\n\n";
    conversations.set(message.author, newContent);
    return reply.substring(reply.lastIndexOf(":") + 1).trim()
}

export default plugin;