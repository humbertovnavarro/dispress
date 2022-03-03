import type {Message as DJSMessage, Client as DJSClient, ClientOptions as DJSClientOptions} from 'discord.js'

export interface ClientOptions extends DJSClientOptions {
  prefix?: string;
  cooldownTime?: number;
  errorMessages?: Map<string, string>;
}

export interface Message<Type> extends DJSMessage {
  context: Type,
  client: Client
}

export interface Client extends DJSClient {
  use: (handler: Handler) => void;
  onCommand(command: string, handler: Handler, middleware?: Handler[])
}

export type DJSMessage = DJSMessage;
export type HandlerNext = () => void | undefined;
export type Handler = (message: Message, next: HandlerNext) => Promise<string | void>;
