import { Client as DJSClient } from 'discord.js';
import type {Message, ClientOptions, Handler, DJSMessage, Client as IClient} from './types';
// eslint-disable-next-line no-unused-vars

export default class Client extends DJSClient implements IClient {
  prefix: string;
  // eslint-disable-next-line no-undef
  cooldowns: Map<string, NodeJS.Timer> = new Map();
  cooldownTime: number;
  middlewareChain: Handler[] = [];
  commandMiddlewares: Map<Handler, Handler[]> = new Map();
  commandHandlers: Map<string, Handler> = new Map();
  constructor(options: ClientOptions) {
    super(options);
    this.prefix = options.prefix || '';
    this.cooldownTime = options.cooldownTime || 300;
    this.on('messageCreate', this.handleMessage);
  }

  async handleMessage(message: DJSMessage) {
    // Middleware chain execution
    for (const handler of this.middlewareChain) {
      try {
        let escape = true;
        const next = () => {
          escape = false;
        };
        // eslint-disable-next-line no-await-in-loop
        const status = await handler(message as Message, next);
        if(status) {
          message.channel.send(status);
        }
        if (escape) {
          return;
        }
      } catch {
        return;
      }
    }
  }

  use(handler: Handler) {
    this.middlewareChain.push(handler);
  }

  onCommand(command: string, handler: Handler, middleware?: Handler[]) {
    this.commandHandlers.set(this.prefix + command, handler);
    if (middleware) {
      this.commandMiddlewares.set(handler, middleware);
    }
  }

}
