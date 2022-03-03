import { Client as DJSClient } from 'discord.js';
import type {Message, ClientOptions, Handler, DJSMessage} from './types';
// eslint-disable-next-line no-unused-vars

export default class Client<Type> extends DJSClient {
  // eslint-disable-next-line no-undef
  middlewareChain: Handler[] = [];
  commandMiddlewares: Map<Handler, Handler[]> = new Map();
  commandHandlers: Map<string, Handler> = new Map();
  constructor(options: ClientOptions) {
    super(options);
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
        const status = await handler(message as Message<Type>, next);
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

}
