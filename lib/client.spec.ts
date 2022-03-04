import DiscordBot from "./client";

describe("DiscordBot", () => {
  const bot = new DiscordBot("!");
  test("processor + command parser", () => {
    let message: any = {};
    let order: number[] = [];
    const mock = jest.fn((m) => {
      message = m;
    });
    const preMockA = jest.fn(() => {
      order.push(1);
    });
    const preMockB = jest.fn(() => {
      order.push(2);
    });
    const preCommandMock = jest.fn(() => {
      order.push(3);
    });
    const postErrorMock = jest.fn(() => {
      order.push(-1);
    });
    const postSuccessMock = jest.fn(() => {
      order.push(4);
    });
    bot.useProcessor("pre", preMockA);
    bot.useProcessor("pre", preMockB);
    bot.useProcessor("pre_command", preCommandMock);
    bot.useProcessor("post_error", postErrorMock);
    bot.useProcessor("post_success", postSuccessMock);
    bot.use({
      name: "ping",
      description: "pings. duh.",
      handler: mock,
    });
    bot.client.emit("messageCreate", {
      content: "!ping 1 2 3 4",
    } as any);
    expect(mock).toBeCalledTimes(1);
    expect(message.args).toEqual(["ping", "1", "2", "3", "4"]);
    expect(bot.processors.get("pre")).toEqual([preMockA, preMockB]);
    expect(order).toEqual([1, 2, 3, 4]);
    bot.use({
      name: "error",
      description: "throws an error",
      handler: () => {
        throw Error;
      },
    });
    bot.client.emit("messageCreate", {
      content: "!error",
    } as any);
    expect(order).toEqual([1, 2, 3, 4, 1, 2, 3, -1]);
  });
});
