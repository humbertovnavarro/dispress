import {
  percentageToProgressBar,
  progressBarBackgroundCharacter,
  progressBarForegroundCharacter
} from './TrackEmbed';
describe('Track Embed', () => {
  test('progress bar', () => {
    const expected = `${progressBarForegroundCharacter.repeat(
      12
    )}${progressBarBackgroundCharacter.repeat(12)}`;
    expect(percentageToProgressBar(50)).toEqual(expected);
    const expected2 = `${progressBarForegroundCharacter.repeat(24)}`;
    expect(percentageToProgressBar(100)).toEqual(expected2);
    const expected3 = `${progressBarBackgroundCharacter.repeat(24)}`;
    expect(percentageToProgressBar(0)).toEqual(expected3);
  });
});
