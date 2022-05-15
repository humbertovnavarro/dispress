import prisma from "./PrismaClient";
import CONFIG from "../config.json";
import type { Config } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();
const setKey = async (key: string, value: string): Promise<Config> => {
    const existing = await prisma.config.findUnique({
        where: {
            key
        }
    });
    if(!existing) {
        const created = await prisma.config.create({
            data: {
                key,
                value
            }
        })
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
}

const deleteKey = async (key: string): Promise<Config> => {
    return await prisma.config.delete({
        where: {
            key
        }
    })
}

const getKey = async (key: string): Promise<string> => {
    const config = await prisma.config.findUnique({
        where: {
            key
        }
    });
    return config?.value || "";
}

const getConfig = (key: string) : string | undefined => {
    const configJSON = CONFIG as {[key: string]: number | boolean | string};
    if(configJSON[key]) return configJSON[key].toString();
    return undefined;
}

const getEnv = (key: string) : string | undefined => {
    if(process.env[key]) {
        return process.env[key] as string;
    }
}

export {
    getKey, setKey, deleteKey, getEnv, getConfig
}