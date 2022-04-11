import type { NextApiRequest, NextApiResponse } from 'next'
import UseBot from '../../discord/main';
import dotenv from 'dotenv';
dotenv.config();
let booted = false;
export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<{ready: boolean}>
) {
  // Bootstrap discord
  const discord = UseBot();
  res.json({ ready: discord.isReady()});
  if(!booted) {
    discord.login(process.env.TOKEN);
    booted = true;
  }
}