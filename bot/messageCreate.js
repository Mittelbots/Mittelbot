const config = require('../src/assets/json/_config/config.json');
const {
    Database
} = require("../src/db/db");
const {
    gainXP
} = require("../src/events/levelsystem/levelsystem");
const {
    checkForScam
} = require("../utils/checkForScam/checkForScam");
const {
    log
} = require('../logs');

const defaultCooldown = new Set();
const settingsCooldown = new Set();
const levelCooldown = new Set();

const lvlconfig = require('../src/assets/json/levelsystem/levelsystem.json');


async function messageCreate(message, bot) {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (message.author.system) return;
    // blacklist(1, message);
    // autoresponse(message);

    const database = new Database();

    await checkForScam(message, database, bot, config, log)

    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    database.query(`SELECT prefix FROM ${message.guild.id}_config`).then(async res => {
        var prefix = await res;

        if (cmd.startsWith(prefix[0].prefix)) {

            let commandfile = bot.commands.get(cmd.slice(prefix[0].prefix.length));
            if (commandfile) { //&& blacklist(0, message)
                database.query(`SELECT cooldown FROM ${message.guild.id}_config`).then(res => {
                    if (settingsCooldown.has(message.author.id) && cmd === `${prefix[0].prefix}settings`) {
                        return message.channel.send(`You have to wait ${config.defaultSettingsCooldown.text} after each Settings Command.`);
                    } else {
                        settingsCooldown.add(message.author.id);
                        setTimeout(async () => {
                            settingsCooldown.delete(message.author.id);
                        }, config.defaultSettingsCooldown.format);
                    }

                    if (defaultCooldown.has(message.author.id)) {
                        return message.channel.send(`You have to wait ${res[0].cooldown / 1000 + 's'|| config.defaultCooldown.text} after each Command.`);
                    } else {
                        defaultCooldown.add(message.author.id);
                        commandfile.run(bot, message, args);

                        setTimeout(async () => {
                            defaultCooldown.delete(message.author.id);
                        }, res[0].cooldown || config.defaultCooldown.format);

                    }
                }).catch(err => {
                    if (config.debug == 'true') console.log(err);
                    return log.fatal(err);
                })

            } else return;

        } else {
            if (!levelCooldown.has(message.author.id)) {
                gainXP(message, database);
                levelCooldown.add(message.author.id);
            } else {
                setTimeout(() => {
                    levelCooldown.delete(message.author.id)
                }, lvlconfig.timeout);
            }
        }
    }).catch(err => {
        if (config.debug == 'true') console.log(err)
        return log.fatal(err);
    });

     
}

module.exports = {
    messageCreate
}