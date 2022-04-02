import type { Command } from '../../../dispress';
jest.mock("../helpers/player", () => {
  return {
    UsePlayer: () => undefined,
    GetActiveChannel: () => undefined
  }
});
import summon from './summon';
describe('Summon slash command tests', () => {
  test('Assert body', () => {
    SelfCheck(summon);
  });
});

function SelfCheck(command: Command) {
  expect(summon.body.name).toBe('summon');
  expect(summon.body.description).toBe('Summon the bot to your channel.');
  expect(summon.body.options.length).toBe(0);
}
