import waifu, { getResponse } from './waifu';
import { User } from 'discord.js';
describe('Anime slash command tests', () => {
  test('Assert body', () => {
    expect(waifu.body.name).toBe('waifu');
    expect(waifu.body.description).toBe('Get a random waifu');
    expect(waifu.body.options.length).toBe(3);
  });
  test('Get response works as intended', () => {
    const user = {
      id: '1234'
    } as User;
    const category = 'bully';
    expect(getResponse(user, 'bully')).toBe('<@1234> bullies <@1234>!');
    expect(getResponse(user, 'cringe')).toBe('<@1234> cringes at <@1234> :|');
    expect(getResponse(user, 'cuddle')).toBe('<@1234> cuddles <@1234> :)');
  });
});
