const config = require('../src/assets/json/_config/config.json');
const {
    checkActiveCommand
} = require('../utils/functions/checkActiveCommand/checkActiveCommand');
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
const {
    getConfig
} = require('../utils/functions/data/getConfig');
const { levelCooldown } = require('../utils/functions/levelsystem/levelsystemAPI');
const { antiSpam, antiInvite } = require('../utils/automoderation/automoderation');
const { getAutomodbyGuild } = require('../utils/functions/data/automod');
const { checkAFK } = require('../utils/functions/data/afk');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { getMemberInfoById } = require('../utils/functions/data/getMemberInfo');

const defaultCooldown = new Set();


async function messageCreate(message, bot) {

    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (message.author.system) return;

    const setting = await getAutomodbyGuild(message.guild.id)

    const isSpam = await antiSpam(setting, message, bot);
    if(isSpam) {
        errorhandler({fatal: false, message: `${main_interaction.user.id} has spammed in ${main_interaction.guild.id}.`});
        return;
    };

    const isInvite = await antiInvite(setting, message, bot);
    if(isInvite) {
        errorhandler({fatal: false, message: `${main_interaction.user.id} has sent an invite in ${main_interaction.guild.id}.`});
        return;
    };

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
        errorhandler({err, message: `${main_interaction.guild.id} dont have any config.`});
        return message.channel.send(config.errormessages.general)
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
            levelCooldown({message, bot})
        }

        if(disabled_modules.indexOf('utils') === -1) {
            const isAFK = checkAFK({message});
            if(isAFK) {
                return message.reply(`The user is currently afk.\`Reason: ${isAFK.reason}\` Since: <t:${isAFK.time}:R>`)
                .then(async msg => {
                    await delay(8000);
                    msg.delete().catch(err => {});
                })
                .catch(err => {})
            }
        }
    }
}

module.exports = {
    messageCreate
}