import uptime, { getUptimeHumanReadable } from './uptime';
describe('Uptime slash command', () => {
  test('Assert body', () => {
    expect(uptime.body).toBeDefined();
    expect(uptime.body.name).toBe('uptime');
    expect(uptime.body.description).toBe('Returns the uptime of the bot');
    const interaction = {
      reply: jest.fn()
    };
    jest.spyOn(process, 'uptime').mockReturnValue(60000);
    uptime.handler(interaction as any);
    expect(interaction.reply).toHaveBeenCalledWith(
      `I've been online for 1 minute`
    );
    jest
      .spyOn(process, 'uptime')
      .mockReturnValue(120000 + 4000 + 60 * 60 * 24 * 2 * 1000);
    interaction.reply.mockReset();
    uptime.handler(interaction as any);
    expect(interaction.reply).toHaveBeenCalledWith(
      `I've been online for 2 days, 2 minutes, 4 seconds`
    );
  });
});
