const Discord = require('discord.js');
const { Client, Util } = require('discord.js');
const client = new Discord.Client();
const { TOKEN ,PREFIX, GOOGLE_API_KEY } = require('./config1');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const request = require('request');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const fs = require('fs');  
const ms = require('ms');



const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();


client.on('warn', console.warn);

client.on('error', console.error);


client.on('msg', async msg => { // eslint-disable-line
  const voiceChannel = msg.member.voiceChannel;

    var msg = msg.content;
    var author = msg.author;
    var channel = msg.channel;
    var guild = msg.guild;
    var user = msg.member
    
	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(PREFIX.length)


  if (command === 'play' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      if (!voiceChannel) {
          return msg.reply("you're not in a vocal channel.");
      }
      const permissions = voiceChannel.permissionsFor(msg.client.user);

      if (!permissions.has('CONNECT')) {
          return msg.reply("I can't connect in this channel.");
      }
      if (!permissions.has('SPEAK')) {
          return msg.reply("I can't talk in this channel.");
      }
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
          const playlist = await youtube.getPlaylist(url);
          const videos = await playlist.getVideos();
          for (const video of Object.values(videos)) {
              const video2 = await youtube.getVideoByID(video.id);
              await handleVideo(video2, msg, voiceChannel, true);
          }
          const embed = new Discord.RichEmbed()
              .setColor("FF0000")
              .setAuthor('Play', 'https://png.icons8.com/play/dusk/50')
              .setDescription(`Added "${playlist.title}" to queue!`);
          return channel.send(embed);
      } else {
          try {
              var video = await youtube.getVideo(url);
          } catch (error) {
              try {
                  var videos = await youtube.searchVideos(searchString, 1);
                  var video = await youtube.getVideoByID(videos[0].id);
              } catch (error) {
                  return espion.new_error(client, error);
              }
          }
          return handleVideo(video, msg, voiceChannel);
      }
  }

  if (command === 'skip' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      var userrole = user.roles;
      if (userrole === null) {
          return;
      }
      if (msg.author.id === config.admin || userrole.find('name', "DJ")) {
          if (!msg.member.voiceChannel) {
              return msg.reply("you're not in a vocal channel.");
          }
          if (!serverQueue) {
              return msg.reply("nothing's playing.");
          }
          const embed = new Discord.RichEmbed()
              .setColor("FF0000")
              .setAuthor('Skip', 'https://png.icons8.com/chevron_right/dusk/50')
              .setDescription(`Song skipped \`⏩\``);
          msg.channel.send(embed);
          serverQueue.connection.dispatcher.end();
          return undefined;
      } else {
          return msg.reply("this command is restricted");
      }
  }

  if (command === 'stop' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      var userrole = user.roles;
      if (userrole === null) {
          return;
      }
      if (msg.author.id === config.admin || userrole.find('name', "DJ")) {
          if (!msg.member.voiceChannel) {
              return msg.reply("you're not in a vocal channel.");
          }
          if (!serverQueue) {
              return msg.reply("nothing's playing.");
          }
          serverQueue.songs = [];
          const embed = new Discord.RichEmbed()
              .setColor("FF0000")
              .setAuthor('Stop', 'https://png.icons8.com/stop/dusk/50')
              .setDescription(`Stop asked by ${msg.author.username} \`🚫\``);
          msg.channel.send(embed);
          serverQueue.connection.dispatcher.end();
          return undefined;
      } else {
          return msg.reply("this command is restricted");
      }
  }

  if (command === 'volume' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      var userrole = user.roles;
      if (userrole === null) {
          return;
      }
      var volume = '';
      var volume = serverQueue.volume <= 10 ? '[▬](http://www.notavone.me/)▬▬▬▬▬▬▬▬▬' : serverQueue.volume <= 20 ? '[▬▬](http://www.notavone.me/)▬▬▬▬▬▬▬▬' : serverQueue.volume <= 30 ? '[▬▬▬](http://www.notavone.me/)▬▬▬▬▬▬▬' : serverQueue.volume <= 40 ? '[▬▬▬▬](http://www.notavone.me/)▬▬▬▬▬▬' : serverQueue.volume <= 50 ? '[▬▬▬▬▬](http://www.notavone.me/)▬▬▬▬▬' : serverQueue.volume <= 60 ? '[▬▬▬▬▬▬](http://www.notavone.me/)▬▬▬▬' : serverQueue.volume <= 70 ? '[▬▬▬▬▬▬▬](http://www.notavone.me/)▬▬▬' : serverQueue.volume <= 80 ? '[▬▬▬▬▬▬▬▬](http://www.notavone.me/)▬▬' : serverQueue.volume <= 90 ? '[▬▬▬▬▬▬▬▬▬](http://www.notavone.me/)▬' : '[▬▬▬▬▬▬▬▬▬▬](http://www.notavone.me/)';
      if (msg.author.id === config.admin || userrole.find('name', "DJ")) {
          if (!msg.member.voiceChannel) {
              return msg.reply("you're not in a vocal channel.");
          }
          if (!serverQueue) {
              return msg.reply("nothing's playing.");
          }
          if (!args[0]) {
              const embed = new Discord.RichEmbed()
                  .setColor("FF0000")
                  .setAuthor('Volume', 'https://png.icons8.com/audio/dusk/50')
                  .setDescription(`
Actual volume : **${serverQueue.volume}%**
\`[1%]\` ${volume} \`[100%] 🔊\`
                  `);
              return msg.channel.send(embed);
          } else if (args[0] < 1 || args[0] > 100) {
              return msg.reply("you don't have access to those values (Authorized values : 1 to 100)");
          } else {
              serverQueue.volume = args[0];
              serverQueue.connection.dispatcher.setVolume(args[0] / 100);

              var newvolume = '';
              var newvolume = serverQueue.volume <= 10 ? '[▬](http://www.notavone.me/)▬▬▬▬▬▬▬▬▬' : serverQueue.volume <= 20 ? '[▬▬](http://www.notavone.me/)▬▬▬▬▬▬▬▬' : serverQueue.volume <= 30 ? '[▬▬▬](http://www.notavone.me/)▬▬▬▬▬▬▬' : serverQueue.volume <= 40 ? '[▬▬▬▬](http://www.notavone.me/)▬▬▬▬▬▬' : serverQueue.volume <= 50 ? '[▬▬▬▬▬](http://www.notavone.me/)▬▬▬▬▬' : serverQueue.volume <= 60 ? '[▬▬▬▬▬▬](http://www.notavone.me/)▬▬▬▬' : serverQueue.volume <= 70 ? '[▬▬▬▬▬▬▬](http://www.notavone.me/)▬▬▬' : serverQueue.volume <= 80 ? '[▬▬▬▬▬▬▬▬](http://www.notavone.me/)▬▬' : serverQueue.volume <= 90 ? '[▬▬▬▬▬▬▬▬▬](http://www.notavone.me/)▬' : '[▬▬▬▬▬▬▬▬▬▬](http://www.notavone.me/)';

              const embed = new Discord.RichEmbed()
                  .setColor("FF0000")
                  .setAuthor('Volume', 'https://png.icons8.com/audio/dusk/50')
                  .setDescription(`
Volume is now set at **${args[0]}%**
\`[1%]\` ${newvolume} \`[100%] 🔊\`
                  `);
              return msg.channel.send(embed);
          }

      } else {
          return msg.reply("this command is restricted");
      }
  }

  if (command === 'now' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      if (!serverQueue) {
          return msg.reply("nothing's playing.");
      }
      const embed = new Discord.RichEmbed()
          .setColor("FF0000")
          .setAuthor('Now', 'https://png.icons8.com/play/dusk/50')
          .addField('Now playing:', `${serverQueue.songs[0].title} \`🔊\``)
          .setImage(`https://i.ytimg.com/vi/${serverQueue.songs[0].id}/maxresdefault.jpg`, serverQueue.songs[0].url, 100, 100);
      return channel.send(embed);
  }
  if (command === 'queue' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      if (!serverQueue) {
          return msg.reply("nothing's playing.");
      }
      var index = 0;
      var page = 1;
      var longArray = serverQueue.songs;
      var shortArrays = [],
          i, len;
      for (i = 0, len = longArray.length; i < len; i += 10) {
          shortArrays.push(longArray.slice(i, i + 10));
      }
      const embed = new Discord.RichEmbed()
          .setColor("FF0000")
          .setAuthor('Queue', 'https://png.icons8.com/sorting/dusk/50')
          .setDescription(shortArrays[page - 1].map((song) => `${song.title}`));
      if (shortArrays.length > 1) {
          embed.setFooter(`Viewing page ${page} of ${shortArrays.length}`);
      }
      channel.send(embed).then((msg) => {
          if (shortArrays.length > 1) {
              msg.react('⏪').then(() => {
                  msg.react('🛑').then(() => msg.react('⏩'));
              });
          }
          const backwards = msg.createReactionCollector((reaction) => reaction.emoji.name === '⏪', {
              time: ms('1day')
          });
          const forwards = msg.createReactionCollector((reaction) => reaction.emoji.name === '⏩', {
              time: ms('1day')
          });
          const page1 = msg.createReactionCollector((reaction) => reaction.emoji.name === '🛑', {
              time: ms('1day')
          });
          page1.on('end', (msg) => msg.clearReactions());

          function BackwardReset() {
              embed.setDescription(shortArrays[page - 1].map((song) => `${song.title}`));
              embed.setFooter(`Viewing page ${page} of ${shortArrays.length}`);
              msg.edit(embed);
          }

          function ForwardReset() {
              embed.setDescription(shortArrays[page - 1].map((song) => `${song.title}`));
              embed.setFooter(`Viewing page ${page} of ${shortArrays.length}`);
              msg.edit(embed);
          }

          function Page1Reset() {
              embed.setDescription(shortArrays[page - 1].map((song) => `${song.title}`));
              embed.setFooter(`Viewing page ${page} of ${shortArrays.length}`);
              msg.edit(embed);
          }
          backwards.on('collect', (r) => {
              if (user.id !== config.id) {
                  if (page === 1) {
                      return;
                  }
                  page--;
                  BackwardReset();
                  r.remove(user.id);
              } else {
                  return;
              }
          });
          forwards.on('collect', (r) => {
              if (user.id !== config.id) {
                  if (page === shortArrays.length) {
                      return;
                  }
                  page++;
                  ForwardReset();
                  r.remove(user.id);
              } else {
                  return;
              }
          });
          page1.on('collect', (r) => {
              if (user.id !== config.id) {
                  if (page === 1) {
                      return r.remove(user.id);
                  }
                  page = 1;
                  Page1Reset();
                  r.remove(user.id);
              } else {
                  return;
              }
          });
      });
  }

  if (command === 'pause' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      var userrole = user.roles;
      if (userrole === null) {
          return;
      }
      if (msg.author.id === config.admin || userrole.find('name', "DJ")) {
          if (serverQueue && serverQueue.playing === true) {
              serverQueue.playing = false;
              serverQueue.connection.dispatcher.pause();
              const embed = new Discord.RichEmbed()
                  .setColor("FF0000")
                  .setAuthor('Pause', 'https://png.icons8.com/stop/dusk/50')
                  .setDescription(`Stream paused by ${msg.author.username}`);
              return msg.channel.send(embed);
          }
      }
  }

  if (command === 'resume' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      var userrole = user.roles;
      if (userrole === null) {
          return;
      }
      if (msg.author.id === config.admin || userrole.find('name', "DJ")) {
          if (serverQueue && serverQueue.playing === false) {
              serverQueue.playing = true;
              serverQueue.connection.dispatcher.resume();
              const embed = new Discord.RichEmbed()
                  .setColor("FF0000")
                  .setAuthor('Resume', 'https://png.icons8.com/resume_button/dusk/50')
                  .setDescription(`Stream resumed by ${msg.author.username}`);
              return msg.channel.send(embed);
          }
      }
  }

  if (command === 'repeat' && msg.startsWith(config.prefix)) {
      msg ? msg.delete(2000) : msg;
      if (args[0] === 'on') {
          const TrueEmbed = new Discord.RichEmbed()
              .setColor("FF0000")
              .setAuthor('Repeat', 'https://png.icons8.com/repeat/dusk/50')
              .setDescription(`**Repeat mode : on** \`✅\``);
          serverQueue.repeat = true;
          return msg.channel.send(TrueEmbed);
      } else if (args[0] === 'off') {
          const FalseEmbed = new Discord.RichEmbed()
              .setColor("FF0000")
              .setAuthor('Repeat', 'https://png.icons8.com/repeat/dusk/50')
              .setDescription(`**Repeat mode : off** \`✅\``);
          serverQueue.repeat = false;
          return msg.channel.send(FalseEmbed);
      }
  }

  async function handleVideo(video, msg, voiceChannel, playlist = false) {
      const serverQueue = queue.get(msg.guild.id);
      const song = {
          id: video.id,
          title: (video.title),
          url: `https://www.youtube.com/watch?v=${video.id}`
      };
      if (!serverQueue) {
          const queueConstruct = {
              textChannel: msg.channel,
              voiceChannel: voiceChannel,
              connection: null,
              songs: [],
              volume: 50,
              playing: true,
              repeat: false
          };
          queue.set(msg.guild.id, queueConstruct);

          queueConstruct.songs.push(song);

          try {
              var connection = await voiceChannel.join();
              queueConstruct.connection = connection;
              play(msg.guild, queueConstruct.songs[0]);
          } catch (error) {
              console.log(error);
              return espion.new_error(client, error);
          }
      } else {
          serverQueue.songs.push(song);
          if (playlist) {
              return undefined;
          } else {
              const embed = new Discord.RichEmbed()
                  .setColor("FF0000")
                  .setAuthor('Play', 'https://png.icons8.com/play/dusk/50')
                  .setDescription(`\`${song.title}\` added to queue !`);
              return msg.channel.send(embed);
          }
      }
  }

  function play(guild, song) {
      const serverQueue = queue.get(guild.id);

      if (!song) {
          serverQueue.voiceChannel.leave();
          return queue.delete(guild.id);
      }

      const dispatcher = serverQueue.connection.playStream(ytdl(song.url, {
          filter: "audioonly"
      }));
      dispatcher.on('end', () => {
          try {
              if (!serverQueue) {
                  const embed = new Discord.RichEmbed()
                      .setColor("FF0000")
                      .setAuthor('Music', 'https://png.icons8.com/end/dusk/50')
                      .setDescription(`Queue ended.`);
                  serverQueue.voiceChannel.leave();
                  return msg.channel.send(embed);
              } else if (serverQueue.repeat === true) {
                  play(guild, serverQueue.songs[0]);
              } else {
                  serverQueue.songs.shift();
                  play(guild, serverQueue.songs[0]);
              }
          } catch (error) {
              serverQueue.voiceChannel.leave();
              console.log(error);
              return espion.new_error(client, error);
          }
      });
      dispatcher.on('error', (error) => {
          console.log(error);
          espion.new_error(client, error);
          return msg.channel.send(`I had to stop because :\n\`\`\`${error}\`\`\``);
      });
      dispatcher.setVolume(serverQueue.volume / 100);
      const embed = new Discord.RichEmbed()
          .setColor("FF0000")
          .setAuthor('Play', 'https://png.icons8.com/play/dusk/50')
          .setTitle('Direct link')
          .setURL(song.url)
          .setImage(`https://i.ytimg.com/vi/${song.id}/maxresdefault.jpg`)
          .addField("Now playing :", song.title, false)
          .setTimestamp();
      return serverQueue.textChannel.send(embed);
  }
  
});

client.login(process.env.BOT_TOKEN);
