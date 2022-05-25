import prisma from './PrismaClient';
import CONFIG from '../config.json';
import type { Config } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
const setKey = async (key: string, value: string): Promise<Config> => {
  const existing = await prisma.config.findUnique({
    where: {
      key
    }
  });
  if (!existing) {
    const created = await prisma.config.create({
      data: {
        key,
        value
      }
    });
    return created;
  }
  return await prisma.config.update({
    where: {
      key
    },
    data: {
      value
    }
  });
};

const deleteKey = async (key: string): Promise<Config> => {
  return await prisma.config.delete({
    where: {
      key
    }
  });
};

const getKey = async (key: string): Promise<string> => {
  const config = await prisma.config.findUnique({
    where: {
      key
    }
  });
  return config?.value || '';
};

const getConfig = <T = string>(key: string): T => {
  const configJSON = CONFIG as { [key: string]: any };
  const keys = key.split('.');
  let value = configJSON;
  while (keys.length > 0) {
    try {
      value = value[keys.shift() as string];
    } catch (error) {
      console.error(`Could not load config value, ${key}`);
      process.exit(1);
    }
  }
  return value as T;
};

const getEnv = (key: string): string | undefined => {
  if (process.env[key]) {
    return process.env[key] as string;
  }
};

const assertGetEnv = (key: string): string => {
  const value = getEnv(key);
  if (!value || value === '') {
    console.error(`Could not load required env variable, ${key}`);
    process.exit(1);
  }
  return value;
};

export { getKey, setKey, deleteKey, getEnv, getConfig, assertGetEnv };
