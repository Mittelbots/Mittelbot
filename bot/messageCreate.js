const config = require('../src/assets/json/_config/config.json');
const {checkActiveCommand} = require('../utils/functions/checkActiveCommand/checkActiveCommand');
const levelSystem = require("../utils/functions/levelsystem/levelsystem");
const {
    checkForScam
} = require("../utils/checkForScam/checkForScam");
const {
    log
} = require('../logs');

const defaultCooldown = new Set();
const levelCooldown = new Set();

const lvlconfig = require('../src/assets/json/levelsystem/levelsystem.json');
const database = require('../src/db/db');
const {
    errorhandler
} = require('../utils/functions/errorhandler/errorhandler');
const { translateMessage } = require('../utils/functions/checkLang/translateMessage');

async function messageCreate(message, bot) {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (message.author.system) return;

    await checkForScam(message, bot, config, log);

    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    await database.query(`SELECT prefix FROM ${message.guild.id}_config`).then(async res => {
        var prefix = await res;

        if (cmd.startsWith(prefix[0].prefix)) {

            let commandfile = bot.commands.get(cmd.slice(prefix[0].prefix.length));
            if (commandfile) { //&& blacklist(0, message)

                const isActive = await checkActiveCommand(commandfile.help.name, message.guild.id);

                if(isActive.global_disabled) return message.reply("This command is currently disabled in all Servers. Join the offical support discord For more informations.");
                if(!isActive.enabled) return message.reply("This command is disabled in your Guild.");

                database.query(`SELECT cooldown FROM ${message.guild.id}_config`).then(async res => {

                    if (defaultCooldown.has(message.author.id)) {
                        return message.channel.send(`You have to wait ${res[0].cooldown / 1000 + 's'|| config.defaultCooldown.text} after each Command.`).catch(err => {})
                    } else {
                        if(message.author.id !== config.Bot_Owner_ID) {
                            defaultCooldown.add(message.author.id);
                            setTimeout(async () => {
                                defaultCooldown.delete(message.author.id);
                            }, res[0].cooldown || config.defaultCooldown.format);
                        }
                        return commandfile.run(bot, message, args);
                    }
                }).catch(err => {
                    return errorhandler({err: err, fatal: true});
                })

            } else return;
        return;
        } else { //? NO COMMAND
            
            await translateMessage({message}); //? CURRENTLY ONLY ON GUSTIXA SERVER

            if (!levelCooldown.has(message.author.id)) {
                levelSystem.run(message, bot);

                if(message.author.id !== config.Bot_Owner_ID) {
                    levelCooldown.add(message.author.id);
                }
            } else {
                setTimeout(() => {
                    levelCooldown.delete(message.author.id)
                }, lvlconfig.timeout);
            }
        }
    }).catch(err => {
        return errorhandler({err: err, fatal: true});
    });
}

module.exports = {
    messageCreate
}