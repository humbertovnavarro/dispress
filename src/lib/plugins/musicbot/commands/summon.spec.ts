import type { Command } from '../../../dispress';
import summon from './summon';
import plugin from  '../plugin';
import client from '../../../../main';
describe('Summon slash command tests', () => {
  test('Assert body', () => {
    SelfCheck(summon);
  });
  test('Plugin adds command', () => {
    plugin.beforeReady?.(client);
    expect(client.commands.get(summon.body.name)).toBeDefined();
  })
});

function SelfCheck(command: Command) {
  expect(summon.body.name).toBe('summon');
  expect(summon.body.description).toBe('Summon the bot to your channel.');
  expect(summon.body.options.length).toBe(0);
}
