import type { Command } from '../../../dispress';
import filters from './filters';
import plugin from  '../plugin';
import client from '../../../../main';
describe('Summon slash command tests', () => {
  test('Assert body', () => {
    SelfCheck(filters);
  });
  test('Plugin adds command', () => {
    plugin.beforeReady?.(client);
    expect(client.commands.get(filters.body.name)).toBeDefined();
  })
});

function SelfCheck(command: Command) {
  expect(filters.body.name).toBe('filter');
  expect(filters.body.description).toBe('adds a filter to the player');
  expect(filters.body.options.length).toBe(1);
}
