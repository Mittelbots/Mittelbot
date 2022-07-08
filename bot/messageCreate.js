const config = require('../src/assets/json/_config/config.json');
const {
    checkActiveCommand
} = require('../utils/functions/checkActiveCommand/checkActiveCommand');
const levelSystem = require("../utils/functions/levelsystem/levelsystem");
const {
    checkForScam
} = require("../utils/checkForScam/checkForScam");
const {
    log
} = require('../logs');
const {
    delay
} = require('../utils/functions/delay/delay');
const {
    translateMessage
} = require('../utils/functions/data/translate');
const lvlconfig = require('../src/assets/json/levelsystem/levelsystem.json');
const {
    getConfig
} = require('../utils/functions/data/getConfig');

const defaultCooldown = new Set();
const levelCooldown = new Set();

async function messageCreate(message, bot) {

    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (message.author.system) return;

    var {disabled_modules} = await getConfig({
        guild_id: message.guild.id,
    });

    disabled_modules = JSON.parse(disabled_modules);

    if(disabled_modules.indexOf('scamdetection') === -1) await checkForScam(message, bot, config, log);

    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    const guild_config = await getConfig({
        guild_id: message.guild.id
    });

    if (!guild_config) {
        return await message.channel.send(config.errormessages.general)
            .then(async msg => {
                await delay(5000);
                msg.delete().catch(err => {});
            }).catch(err => {});
    }

    const prefix = guild_config.prefix;
    const cooldown = guild_config.cooldown;

    if (cmd.startsWith(prefix)) {

        let commandfile = bot.commands.get(cmd.slice(prefix.length));
        if (commandfile) { //&& blacklist(0, message)
            if (message.author.id !== config.Bot_Owner_ID) {
                const isActive = await checkActiveCommand(commandfile.help.name, message.guild.id);

                if (isActive.global_disabled) return message.reply("This command is currently disabled in all Servers. Join the offical support discord For more informations.");
                if (!isActive.enabled) return message.reply("This command is disabled in your Guild.");

                if (defaultCooldown.has(message.author.id)) {
                    return message.channel.send(`You have to wait ${cooldown / 1000 + 's'|| config.defaultCooldown.text} after each Command.`).catch(err => {})
                } else {

                    defaultCooldown.add(message.author.id);
                    setTimeout(async () => {
                        defaultCooldown.delete(message.author.id);
                    }, cooldown || config.defaultCooldown.format);
                    return commandfile.run(bot, message, args);
                }
            } else {
                //BOT OWNER BYPASS ;)
                return commandfile.run(bot, message, args);
            }

        } else return;

    } else { //? NO COMMAND
        
        if(disabled_modules.indexOf('autotranslate') === -1){
            translateMessage({
                message
            })
        }

        if(disabled_modules.indexOf('level') === -1) {
            if (!levelCooldown.has(message.author.id)) {
                levelSystem.run(message, bot);

                if (message.author.id !== config.Bot_Owner_ID) {
                    levelCooldown.add(message.author.id);
                }
            } else {
                setTimeout(() => {
                    levelCooldown.delete(message.author.id)
                }, lvlconfig.timeout);
            }
        }
    }
}

module.exports = {
    messageCreate
}