import Discord from "discord.js";
import fs from "fs";
import { StatusBot } from "./status.js";
import { YouTubeBot } from "./youtube.js";

export class MainBot {
  constructor() {
    const { prefix, token } = JSON.parse(fs.readFileSync('config/prod.json'));
    this.prefix = prefix;

    const client = new Discord.Client();
    client.once("ready", () => {
      console.log("Ready!");
    });
    client.once("reconnecting", () => {
      console.log("Reconnecting!");
    });
    client.once("disconnect", () => {
      console.log("Disconnect!");
    });

    const youtube = new YouTubeBot(prefix);
    const status = new StatusBot(prefix);

    client.on("message", async message => {
      if (message.author.bot) return;
      if (!message.content.startsWith(prefix)) return;

      // sub-bots
      if (youtube.onMessage(message)) { return; }
      if (status.onMessage(message)) { return; }

      // else
      const commands = [
        ...this.getCommands(),
        ...youtube.getCommands(),
        ...status.getCommands(),
      ];
      message.channel.send(`
Here are all the commands that mpaulbot supports:

${commands.map(cmd => `**${cmd.command}** ${cmd.description}`).join('\n')}
        `.trim());
    });

    client.login(token);
  }

  getCommands() {
    const { prefix } = this;
    return [
      { command: `${prefix}`, description: 'See this command list', },
    ];
  }
}
