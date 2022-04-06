import { Client } from "discord.js";
import { Application as ExpressApplication } from "express";

export interface Dispress extends Client {
  prefix: string;
  router?: ExpressApplication;
}
