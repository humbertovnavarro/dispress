import type { Command } from '../../../dispress';
jest.mock('../helpers/player', () => {
  return {
    UsePlayer: () => undefined,
    userInBotChannel: () => undefined
  };
});
import filters from './filters';
describe('Summon slash command tests', () => {
  test('Assert body', () => {
    SelfCheck(filters);
  });
});

function SelfCheck(command: Command) {
  expect(filters.body.name).toBe('filter');
  expect(filters.body.description).toBe('adds a filter to the player');
  expect(filters.body.options.length).toBe(1);
}
