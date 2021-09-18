import Discord from "discord.js";
import fs from "fs";
import { YouTubeBot } from "./youtube.js";

export class MainBot {
  constructor() {
    const { prefix, token } = JSON.parse(fs.readFileSync('config/prod.json'));

    const client = new Discord.Client();

    const youtube = new YouTubeBot(prefix);

    client.once("ready", () => {
      console.log("Ready!");
    });

    client.once("reconnecting", () => {
      console.log("Reconnecting!");
    });

    client.once("disconnect", () => {
      console.log("Disconnect!");
    });

    client.on("message", async message => {
      if (message.author.bot) return;
      if (!message.content.startsWith(prefix)) return;

      if (message.content.startsWith(`${prefix}mpaulbot`)) {
        const commands = [
          ...this.getCommands(),
          ...youtube.getCommands(),
        ]
        message.channel.send(`
Here are all the commands that mpaulbot supports:

${commands.map(cmd => `**${prefix}${cmd.command}** ${cmd.description}`).join('\n')}
        `.trim());
        return;
      }

      if (youtube.onMessage(message)) { return; }

      // else
      message.channel.send("You need to enter a valid command!");
    });

    client.login(token);
  }

  getCommands() {
    return [
      { command: 'mpaulbot', description: 'See this command list', },
    ];
  }
}
