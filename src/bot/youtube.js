import ytdl from "ytdl-core";
import { BotUtil } from "./util.js";

export class YouTubeBot {
  queue = new Map();
  constructor(prefix) {
    this.prefix = prefix;
  }

  getCommands() {
    return [
      { command: 'play [YouTube url]', description: 'Add a song to the playlist', },
      { command: 'list', description: 'View the current playlist', },
      { command: 'skip', description: 'Skip to the next song in the playlist', },
      { command: 'stop', description: 'Stop the entire playlist', },
      { command: 'volume [0-100]', description: 'Set the volume for the bot', },
    ];
  }

  onMessage(message) {
    const { prefix, queue } = this;
    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}play`)) {
      this.execute(message, serverQueue);
      return true;
    } else if (message.content.startsWith(`${prefix}list`)) {
      this.list(message, serverQueue);
      return true;
    } else if (message.content.startsWith(`${prefix}skip`)) {
      this.skip(message, serverQueue);
      return true;
    } else if (message.content.startsWith(`${prefix}stop`)) {
      this.stop(message, serverQueue);
      return true;
    } else if (message.content.startsWith(`${prefix}volume`)) {
      this.volume(message, serverQueue);
      return true;
    }
  };

  async execute(message, serverQueue) {
    const { queue } = this;
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    let songInfo;
    try {
      songInfo = await ytdl.getInfo(args[1]);
    } catch (err) {
      return message.channel.send(`${args[1]} was not found. Please enter a valid YouTube url`);
    }
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      lengthSeconds: songInfo.videoDetails.lengthSeconds,
    };

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 50,
        playing: true,
      };

      queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        const connection = await voiceChannel.join();
        queueContruct.connection = connection;
        this.play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }

  skip(message, serverQueue) {
    if (!message.member.voice.channel) {
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    }
    if (!serverQueue) {
      return message.channel.send("There is no song that I could skip!");
    }
    serverQueue.connection.dispatcher.end();
  }

  stop(message, serverQueue) {
    if (!message.member.voice.channel) {
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    }
    if (!serverQueue) {
      return message.channel.send("There is no song that I could stop!");
    }
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }

  play(guild, song) {
    const { queue } = this;
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        this.play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }

  list(message, serverQueue) {
    if (!serverQueue || serverQueue.songs.length === 0) {
      message.channel.send(`The playlist is currently empty`);
      return;
    }
    serverQueue.textChannel.send(`
Here is the current playlist (Volume: ${serverQueue.volume}%)
${serverQueue.songs.map((song, i) => `(${BotUtil.secondsToDisplay(song.lengthSeconds)}) ${song.title}`).join('\n')}
    `.trim());
  }

  volume(message, serverQueue) {
    if (!message.member.voice.channel) {
      return message.channel.send(
        "You have to be in a voice channel to adjust the volume!"
      );
    }
    if (!serverQueue) {
      return message.channel.send("You can only adjust volume while music is playing");
    }

    const args = message.content.split(" ");
    const volumeArg = args[1];
    const newVolume = parseFloat(volumeArg ?? '');
    if (isNaN(newVolume) || newVolume < 0 || newVolume > 100) {
      return message.channel.send(
        "To change the volume, you need to pass in a number between 0 and 100"
      );
    }

    serverQueue.volume = Math.floor(newVolume);
    serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    return message.channel.send(
      `Volume has been set to ${serverQueue.volume}%`
    );
  }
}
