import type { NextApiRequest, NextApiResponse } from 'next'
import client from '../../discord/main';
import dotenv from 'dotenv';
dotenv.config();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ready: boolean}>
) {
  const discord = await client();
  res.json({ready: discord.isReady()})
}
