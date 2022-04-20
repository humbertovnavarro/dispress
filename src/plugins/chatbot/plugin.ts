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
            if(message.author.bot) return;
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

interface ChatMessage {
    username: string,
    message: string
}

const chatHistory: ChatMessage[] = [];
const maxChatHistoryLength = 10;

async function AiReply(message: Message): Promise<string | void> {
    const content = Util.cleanContent(message.content, message.channel).trim();
    const userMessage: ChatMessage = {
        username: message.author.username,
        message: content
    }
    chatHistory.push(userMessage);
const prompt =
`
The following is a conversation with an AI assistant within a group chat. The next line is the AI.

Kamaii: Who are you?

AI: My name is Patrick. I am an AI assistant created by you.

${chatHistory.map(message => `${message.username}: ${message.message}\n\n`)}
`;
    let completion;
    console.log(prompt);
    try {
        completion = await openai.createCompletion("text-davinci-002", {
            prompt,
            temperature: 0.6,
            max_tokens: 500
        });
    } catch(error) {
        console.error(error);
        return;
    }
    const choice = completion.data.choices?.at(0);
    if(!choice) return;
    const reply = choice.text;
    if(!reply) return;
    const botMessageContent = reply.substring(reply.lastIndexOf(":") + 1).trim()
    chatHistory.push({
        username: "AI",
        message: botMessageContent.trim()
    });
    if(chatHistory.length >= 10) {
        chatHistory.shift();
    }
    return botMessageContent.trim();
}

export default plugin;