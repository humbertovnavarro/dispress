import type {Message as DJSMessage, Client as DJSClient, ClientOptions as DJSClientOptions} from 'discord.js'

export interface ClientOptions extends DJSClientOptions {
  prefix?: string;
  cooldownTime?: number;
  errorMessages?: Map<string, string>;
}

export interface Client extends DJSClient {
  prefix: string;
  cooldowns: Map<string, NodeJS.Timer>
}

export interface Message extends DJSMessage {
  args?: string[],
  users?: string[],
  client: Client
}

interface Client {
  prefix: string;
  cooldowns: Map<string, NodeJS.Timer>;
  cooldownTime: number;
  use: (handler: Handler) => void;
  onCommand(command: string, handler: Handler, middleware?: Handler[])
}

export type DJSMessage = DJSMessage;
export type HandlerNext = () => void | undefined;
export type Handler = (message: Message, next: HandlerNext) => Promise<string | void>;
