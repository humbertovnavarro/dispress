import CONFIG from '../config.json';
import dotenv from 'dotenv';
dotenv.config();
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

export { getEnv, getConfig, assertGetEnv };
