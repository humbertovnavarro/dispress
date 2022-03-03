import Client from './client';
import type { Message } from './types';
describe("Base case", () => {
  test("Imports", () => {
    expect(true);
  })
  test("Middleware", async () => {
    const client = new Client({
      intents: [],
      prefix: "foo"
    });
    const mockMessage = {content: "foo", order: []} as unknown as Message;
    let testMessage: any;
    let nextFunction;

    const middlewareA: any = jest.fn((message, next) => {
      testMessage = message;
      nextFunction = next;
      message.order.push("a");
      next();
    });

    const middlewareB: any = jest.fn((message, next) => {
      testMessage = message;
      nextFunction = next;
      message.order.push("b");
      next();
    });

    const middlewareC: any = jest.fn((message, next) => {
      testMessage = message;
      nextFunction = next;
      message.order.push("c");
    });

    const middlewareD: any = jest.fn((message, next) => {
      testMessage = message;
      nextFunction = next;
      message.order.push("d");
    });

    client.use(middlewareA);
    client.use(middlewareB);
    client.use(middlewareC);
    client.use(middlewareD);

    expect(client.middlewareChain).toEqual([middlewareA, middlewareB, middlewareC, middlewareD]);
    await client.handleMessage(mockMessage);
    expect(middlewareA).toBeCalledTimes(1);
    expect(middlewareB).toBeCalledTimes(1);
    expect(middlewareC).toBeCalledTimes(1);
    expect(middlewareD).not.toBeCalled();
    expect(testMessage.order).toEqual(["a","b","c"]);
  })
})
