import anime from './anime';
describe('Anime slash command tests', () => {
  test('Assert body', () => {
    expect(anime.body.name).toBe('anime');
    expect(anime.body.description).toBe('Search for anime');
    expect(anime.body.options[0]).toEqual({
      autocomplete: undefined,
      choices: undefined,
      description: 'anime name',
      name: 'name',
      required: true,
      type: 3
    });
    expect(anime.body.options.length).toBe(1);
  });
});
