import { Plugin } from '../../lib/dispress/dispress';
import DiscordBot from '../../lib/dispress/DiscordBot';
import { Configuration, OpenAIApi } from 'openai';
import { Guild, Message, Util } from 'discord.js';
import { getEnv } from '../../lib/config';

const configuration = new Configuration({
  apiKey: getEnv('OPENAI_API_KEY')
});

const openai = new OpenAIApi(configuration);
const chatGuildHistoryMap: Map<Guild, ChatMessage[]> = new Map();
const plugin: Plugin = {
  name: 'chatbot',
  onReady: (bot: DiscordBot) => {
    const uid = bot.user?.id;
    if (!uid) return;
    bot.on('messageCreate', async (message: Message) => {
      if (message.author.bot) return;
      if (message.content.trim().toLowerCase() === 'dispress forget') {
        if (message.guild) chatGuildHistoryMap.set(message.guild, []);
        try {
          message.reply('I forgot everything.');
        } catch (error) {
          console.error(error);
        }
        return;
      }

      if (message.content.trim().toLowerCase().startsWith('dispress raw')) {
        try {
          const completion = await openai.createCompletion('text-davinci-002', {
            prompt: message.content.substring('dispress raw'.length + 1),
            temperature: 0.6,
            max_tokens: 2000
          });
          message.reply(completion.data.choices?.at(0)?.text || 'error');
          return;
        } catch (error) {
          console.error(error);
          return;
        }
      }

      const doAiReply =
        Math.random() > 0.96 ||
        message.content.toLowerCase().includes('dispress');
      if (doAiReply) {
        try {
          const reply = await AiReply(message);
          if (reply) {
            message.channel.send(reply);
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  }
};

interface ChatMessage {
  username: string;
  message: string;
}

const maxChatHistoryLength = 10;

async function AiReply(message: Message): Promise<string | void> {
  if (!message.guild) return;
  const content = Util.cleanContent(message.content, message.channel).trim();
  const userMessage: ChatMessage = {
    username: message.author.username,
    message: content
  };
  const chatHistory = chatGuildHistoryMap.get(message.guild) || [];
  chatHistory.push(userMessage);
  const prompt = `
The following is a conversation with an AI assistant within a group chat. The next line is the AI.

Kamaii: Who are you?

AI: My name is Dispress. I am an AI assistant, how may I assist you?

${chatHistory.map(message => `${message.username}: ${message.message}\n\n`)}
`;
  let completion;
  try {
    completion = await openai.createCompletion('text-davinci-002', {
      prompt,
      temperature: 0.6,
      max_tokens: 1900
    });
  } catch (error) {
    console.error(error);
    return;
  }
  const choice = completion.data.choices?.at(0);
  if (!choice) return;
  const reply = choice.text;
  if (!reply) return;
  const botMessageContent = reply.substring(reply.lastIndexOf('I:') + 2).trim();
  chatHistory.push({
    username: 'AI',
    message: botMessageContent.trim()
  });
  if (chatHistory.length >= 10) {
    chatHistory.shift();
  }
  chatGuildHistoryMap.set(message.guild, chatHistory);
  return botMessageContent.trim();
}

export default plugin;
