const config = require('../src/assets/json/_config/config.json');
const { delay } = require('../utils/functions/delay/delay');
const { antiSpam } = require('../utils/automoderation/antiSpam');
const { antiInvite } = require('../utils/automoderation/antiInvite');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { Guilds } = require('../utils/functions/data/Guilds');
const Afk = require('../utils/functions/data/Afk');
const { Levelsystem } = require('../utils/functions/data/levelsystemAPI');
const { GuildConfig } = require('../utils/functions/data/Config');
const Translate = require('../utils/functions/data/translate');
const { checkOwnerCommand } = require('../utils/functions/data/Owner');
const { anitLinks } = require('../utils/automoderation/antiLinks');
const AutoBlacklist = require('../utils/functions/data/AutoBlacklist');
const ScamDetection = require('../utils/checkForScam/checkForScam');
const Autodelete = require('../utils/functions/data/Autodelete');
const { EmbedBuilder, ChannelType } = require('discord.js');
const { banAppealModule } = require('../utils/modules/banAppeal');
const Modules = require('../utils/functions/data/Modules');

async function messageCreate(message, bot) {
    if (
        message.channel.type === ChannelType.DM &&
        !message.author.bot &&
        !message.author.system &&
        message.reference
    ) {
        return await banAppealModule(message, bot);
    }

    if (message.channel.type === ChannelType.DM && message.author.id === config.Bot_Owner_ID) {
        return checkOwnerCommand(message);
    }
    if (message.author.bot && message.channel.id !== process.env.DC_DEBUG) {
        return await new AutoBlacklist().check(message, bot);
    }
    if (
        message.channel.type === ChannelType.DM ||
        message.author.system ||
        !message.author ||
        (bot.user.id === '921779661795639336' && message.author.id !== bot.ownerId)
    )
        return;

    /** ======================================================= */

    const moduleApi = new Modules(message.guild.id, bot);
    const defaultModuleSettings = moduleApi.getDefaultSettings();

    /** ======================================================= */

    const isOnBlacklist = (await moduleApi.checkEnabled(defaultModuleSettings.blacklist.name))
        ? await Guilds.isBlacklist(message.guild.id)
        : false;
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

    /** ======================================================= */

    const isSpam = (await moduleApi.checkEnabled(defaultModuleSettings.antiSpam.name))
        ? await antiSpam(message, bot)
        : false;
    if (isSpam) {
        errorhandler({
            fatal: false,
            message: `${message.author.id} has spammed in ${message.guild.id}.`,
        });
        return;
    }

    /** ======================================================= */

    const isInvite = (await moduleApi.checkEnabled(defaultModuleSettings.anitInvite.name))
        ? await antiInvite(message, bot)
        : false;
    if (isInvite) {
        errorhandler({
            fatal: false,
            message: `${message.author.id} has sent an invite in ${message.guild.id}.`,
        });
        return;
    }

    /** ======================================================= */

    const isLink = (await moduleApi.checkEnabled(defaultModuleSettings.antiLinks.name))
        ? await anitLinks(message, bot)
        : false;
    if (isLink) {
        errorhandler({
            fatal: false,
            message: `${message.author.id} has sent a link in ${message.guild.id}.`,
        });
        return;
    }

    /** ======================================================= */

    const isScam = (await moduleApi.checkEnabled(defaultModuleSettings.scamdetection.name))
        ? await new ScamDetection().check(message, bot)
        : false;
    if (isScam) {
        return;
    }

    /** ======================================================= */

    const isAutodelete = (await moduleApi.checkEnabled(defaultModuleSettings.autodelete.name))
        ? await new Autodelete(bot).check(message.channel, message)
        : false;
    if (isAutodelete) {
        message.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Wrong message Type!')
                        .setDescription(
                            'This channel is not accessable with the message type you have sent. Please send the right message type or use another channel. (only Text, only Emotes, only Media or only Stickers)'
                        )
                        .setColor('#FF0000'),
                ],
            })
            .then(async (msg) => {
                await delay(6000);
                msg.delete().catch((err) => {});
            })
            .catch((err) => {});

        return message.delete().catch((err) => {});
    }

    /** ======================================================= */

    if (await moduleApi.checkEnabled(defaultModuleSettings.autotranslate.name)) {
        new Translate().translate(message);
    }

    /** ======================================================= */

    if (await moduleApi.checkEnabled(defaultModuleSettings.level.name)) {
        Levelsystem.run({ message, bot });
    }

    /** ======================================================= */

    if (await moduleApi.checkEnabled(defaultModuleSettings.utils.name)) {
        const isAFK = await new Afk().check({ message });
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

    /** ======================================================= */

    return false;
}

module.exports = {
    messageCreate,
};
