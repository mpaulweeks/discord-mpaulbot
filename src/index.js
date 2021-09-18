import { MainBot } from "./bot/index.js";
import { Updater } from "./updater/index.js";

// start bot
new MainBot();

// setup forever cron
if (process.env['FOREVER']) {
  new Updater().cron();
}
