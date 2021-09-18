import fs from 'fs';
import { BotUtil } from "./util.js";

export class StatusBot {
  startedAt = new Date();
  constructor(prefix) {
    this.prefix = prefix;
    this.npmPackage = JSON.parse(fs.readFileSync('package.json'));
  }

  getCommands() {
    const { prefix } = this;
    return [
      { command: `${prefix} status`, description: 'Check bot status', },
    ];
  }

  onMessage(message) {
    const { prefix, queue } = this;

    if (message.content.startsWith(`${prefix} status`)) {
      this.status(message);
      return true;
    }
  }

  status(message) {
    const { npmPackage, startedAt } = this;
    const seconds = Math.floor((new Date().getTime() - startedAt.getTime()) / 1000);
    message.channel.send(`
${npmPackage.name} v${npmPackage.version}
This bot has been alive for ${BotUtil.secondsToDisplay(seconds)}
`.trim());
  }
}
