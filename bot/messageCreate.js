const config = require('../src/assets/json/_config/config.json');
const { checkActiveCommand } = require('../utils/functions/checkActiveCommand/checkActiveCommand');
const { delay } = require('../utils/functions/delay/delay');
const { antiSpam } = require('../utils/automoderation/antiSpam');
const { antiInvite } = require('../utils/automoderation/antiInvite');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { Guilds } = require('../utils/functions/data/Guilds');
const { Afk } = require('../utils/functions/data/Afk');
const { Levelsystem } = require('../utils/functions/data/levelsystemAPI');
const { GuildConfig } = require('../utils/functions/data/Config');
const Translate = require('../utils/functions/data/translate');
const { checkOwnerCommand } = require('../utils/functions/data/Owner');
const { anitLinks } = require('../utils/automoderation/antiLinks');

const defaultCooldown = new Set();

async function messageCreate(message, bot) {
    if (message.channel.type == '1' && message.author.id === config.Bot_Owner_ID) {
        return checkOwnerCommand(message);
    }
    if (message.author.bot || message.channel.type == '1' || message.author.system) return;

    const isOnBlacklist = await Guilds.isBlacklist(message.guild.id);
    if (isOnBlacklist) {
        const guild = bot.guilds.cache.get(message.guild.id);

        await bot.users.cache
            .get(guild.ownerId)
            .send({
                content: `Hello. I'm sorry but your server is on the blacklist and i'll leave your server again. If it's false please join the official discord support server. https://mittelbot.blackdayz.de/support.`,
            })
            .catch((err) => {});

        errorhandler({
            fatal: false,
            message: ` I was in a BLACKLISTED Guild, but left after >messageCreate< : ${guild.name} (${guild.id})`,
        });

        return guild.leave().catch((err) => {});
    }

    const isSpam = await antiSpam(message, bot);
    if (isSpam) {
        errorhandler({
            fatal: false,
            message: `${message.user.id} has spammed in ${message.guild.id}.`,
        });
        return;
    }

    const isInvite = await antiInvite(message, bot);
    if (isInvite) {
        errorhandler({
            fatal: false,
            message: `${message.user.id} has sent an invite in ${message.guild.id}.`,
        });
        return;
    }

    const isLink = await anitLinks(message, bot);
    if (isLink) {
        errorhandler({
            fatal: false,
            message: `${message.user.id} has sent a link in ${message.guild.id}.`,
        });
        return;
    }

    const guildConfig = await GuildConfig.get(message.guild.id);

    disabled_modules = guildConfig.disabled_modules;

    if (disabled_modules.indexOf('scamdetection') === -1) {
        //const isScam = await checkForScam(message, bot, config, log);
        //if (isScam) return;
    }

    let messageArray = message.content.split(' ');
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    const prefix = guildConfig.prefix;
    const cooldown = guildConfig.cooldown;

    if (cmd.startsWith(prefix)) {
        let commandfile = bot.commands.get(cmd.slice(prefix.length));
        if (commandfile) {
            //&& blacklist(0, message)
            const isActive = await checkActiveCommand(commandfile.help.name, message.guild.id);

            if (isActive.global_disabled)
                return message.reply(
                    'This command is currently disabled in all Servers. Join the offical support discord For more informations.'
                );
            if (!isActive.enabled) return message.reply('This command is disabled in your Guild.');

            if (defaultCooldown.has(message.author.id)) {
                return message.channel
                    .send(
                        `You have to wait ${
                            cooldown / 1000 + 's' || config.defaultCooldown.text
                        } after each Command.`
                    )
                    .catch((err) => {});
            } else {
                defaultCooldown.add(message.author.id);
                setTimeout(async () => {
                    defaultCooldown.delete(message.author.id);
                }, cooldown || config.defaultCooldown.format);
                return commandfile.run(bot, message, args);
            }
        } else return;
    } else {
        //? NO COMMAND

        if (disabled_modules.indexOf('autotranslate') === -1) {
            new Translate().translate(message);
        }

        if (disabled_modules.indexOf('level') === -1) {
            Levelsystem.run({ message, bot });
        }

        if (disabled_modules.indexOf('utils') === -1) {
            const isAFK = Afk.check({ message });
            if (isAFK) {
                return message
                    .reply(
                        `The user is currently afk.\`Reason: ${isAFK.reason}\` Since: <t:${isAFK.time}:R>`
                    )
                    .then(async (msg) => {
                        await delay(8000);
                        msg.delete().catch((err) => {});
                    })
                    .catch((err) => {});
            }
        }
    }
}

module.exports = {
    messageCreate,
};
