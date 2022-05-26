import { Guild } from 'discord.js';
import _ from 'lodash';
import { getConfig } from '../../../../lib/config';
const dislikeThreshold =
  getConfig<number>('plugins.musicbot.dislikeThreshold') || 0;
const generatePlaylist = async (guild: Guild): Promise<string[]> => {
  return [];
};
export default generatePlaylist;
