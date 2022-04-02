import waifu from './waifu';
import client from '../main';
describe('Anime slash command tests', () => {
  test('Assert body', () => {
    expect(waifu.body.name).toBe('waifu');
    expect(waifu.body.description).toBe('Get a random waifu');
    expect(waifu.body.options.length).toBe(2);
  });
  test('Client has waifu command', () => {
    expect(client.getCommand('waifu')).toBe(waifu);
  });
});
