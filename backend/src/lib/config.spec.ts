import { getConfig } from './config';
describe('Config tests', () => {
  it('should return the correct value', () => {
    expect(getConfig('dispress.owner')).toBe('141320459244404736');
  });
});
