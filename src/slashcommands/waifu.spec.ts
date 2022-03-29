import waifu from './waifu';
const categories = {
  autocomplete: undefined,
  choices: [
    { name: 'bully', value: 'bully' },
    { name: 'cry', value: 'cry' },
    { name: 'hug', value: 'hug' },
    { name: 'awoo', value: 'awoo' },
    { name: 'yeet', value: 'yeet' },
    { name: 'cringe', value: 'cringe' },
    { name: 'dance', value: 'dance' },
    { name: 'slap', value: 'slap' },
    { name: 'wink', value: 'wink' },
    { name: 'kill', value: 'kill' },
    { name: 'nom', value: 'nom' },
    { name: 'bonk', value: 'bonk' },
    { name: 'pat', value: 'pat' },
    { name: 'lick', value: 'lick' },
    { name: 'cuddle', value: 'cuddle' }
  ],
  description: 'type of waifu',
  name: 'category',
  required: false,
  type: 3
};
const user = {
  autocomplete: undefined,
  choices: undefined,
  description: '@mention a user with waifu',
  name: 'user',
  required: false,
  type: 6
};

describe('Anime slash command tests', () => {
  test('Assert body', () => {
    expect(waifu.body.name).toBe('waifu');
    expect(waifu.body.description).toBe('Get a random waifu');
    expect(waifu.body.options.length).toBe(2);
    expect(waifu.body.options[0]).toEqual(categories);
    expect(waifu.body.options[1]).toEqual(user);
  });
});
