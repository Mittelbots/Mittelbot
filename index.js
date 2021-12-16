const Discord = require("discord.js");
const fs = require('fs');
const config = require('./config.json');
const { database } = require("./src/db/db");
const { checkInfractions } = require("./src/events/checkInfraction");
const { checkTemproles } = require("./src/events/checkTemproles");
const defaultCooldown = new Set();

const bot = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"]
});
bot.commands = new Discord.Collection();

let modules = fs.readdirSync('./src/commands/');
modules.forEach((module) => {
  fs.readdir(`./src/commands/${module}`, (err, files) => {
    if(err) {
      console.log(`Mission Folder!!`, err);
    }
    files.forEach((file) => {
      if(!file.endsWith('.js')) return;
      let command = require(`./src/commands/${module}/${file}`);
      console.log(`${command.help.name} Command has been loaded!`);
      if(command.help.name) bot.commands.set(command.help.name, command)

    })
  });
})

//When a member join add a role called Member to them and welcome them in a channel welcome
bot.on('guildMemberAdd', member => {
  //Log the newly joined member to console
  console.log('User' + member.user.tag + ' has joined the server!');

  //Find a channel named welcome and send a Welcome message
  bot.channels.cache.find(c => c.name === "m-sotstis").send('Welcome ' + member.user.username)

  //Find a role called Member
  let role = member.guild.roles.cache.find(r => r.name === 'Member');

  //After 10 seconds add the member role to new user
  setTimeout(function () {
    member.roles.add(role);
  }, 10000);
});

//Command Manager
bot.on("messageCreate", async message => {
  //Check if author is a bot or the message was sent in dms and return
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  //get prefix from config and prepare message so it can be read as a command
  let prefix = config.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  //Check for prefix
  if (!cmd.startsWith(config.prefix)) return;

  //Get the command from the commands collection and then if the command is found run the command file
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if (commandfile) {
    if (defaultCooldown.has(message.author.id)) {
      message.channel.send(`Wait ${config.defaultCooldown.text} before getting typing this again.`);
      return
    } else {
      commandfile.run(bot, message, args);
      
      defaultCooldown.add(message.author.id);
      setTimeout(async () => {
        defaultCooldown.delete(message.author.id);
      }, config.defaultCooldown.format);
    }
  }
});

bot.once('ready', () => {
  
  checkInfractions(bot);
  checkTemproles(bot)

  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server****`);
  bot.user.setActivity({
    name: "Dev Bot for Chilled Sad",
    type: 'PLAYING'
  })
});

const token = require('./_secret/token.json');
bot.login(token.BOT_TOKEN);