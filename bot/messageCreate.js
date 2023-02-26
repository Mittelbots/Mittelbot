const config = require('../src/assets/json/_config/config.json');
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
const AutoBlacklist = require('../utils/functions/data/AutoBlacklist');
const ScamDetection = require('../utils/checkForScam/checkForScam');
const Autodelete = require('../utils/functions/data/Autodelete');
const { EmbedBuilder, ChannelType } = require('discord.js');
const Banappeal = require('../utils/functions/data/Banappeal');

async function messageCreate(message, bot) {
    if (
        message.channel.type === ChannelType.DM &&
        !message.author.bot &&
        !message.author.system &&
        message.reference
    ) {
        const banappeal = new Banappeal(bot);
        const guild_id = await banappeal.getBanAppealMessage(message);
        const userBanAppeal = await banappeal.getBanappeal(guild_id, message.author.id);
        if (!userBanAppeal) return;

        const isOverCooldown = await banappeal.isOverCooldown(userBanAppeal.id);
        if (!isOverCooldown) {
            return message
                .reply({
                    content: `You can not send a new appeal yet.`,
                })
                .catch((err) => {});
        }

        if (userBanAppeal.appeal_msg && userBanAppeal.isAccepted === undefined) {
            return message
                .reply({
                    content: 'You already sent an appeal. Please wait for an answer.',
                })
                .catch((err) => {});
        } else if (userBanAppeal.isAccepted == true || userBanAppeal.isAccepted == false) {
            message
                .reply({
                    content: `Your appeal was ${
                        userBanAppeal.isAccepted ? 'accepted' : 'denied'
                    }. You can not send a new appeal.`,
                })
                .catch((err) => {});
            return;
        }

        const cleanedMessage = banappeal.cleanUserInput(message.content);
        if (cleanedMessage.length < 10) {
            return message
                .reply({
                    content: 'Your appeal is too short. Please write a longer appeal.',
                })
                .catch((err) => {});
        } else if (cleanedMessage.length > 19000) {
            return message
                .reply({
                    content: 'Your appeal is too long. Please write a shorter appeal.',
                })
                .catch((err) => {});
        }

        banappeal.updateBanappeal(guild_id, message.author.id, cleanedMessage, 'appeal_msg');
        banappeal
            .sendAppealToAdmins(guild_id, message.author.id)
            .then(() => {
                message
                    .reply({
                        content: 'Your appeal was sent to the admins. Please wait for an answer.',
                    })
                    .catch((err) => {});
            })
            .catch((err) => {
                message
                    .reply({
                        content: `An error occurred while sending your appeal. Please try again later. Error: **${err}**`,
                    })
                    .catch((err) => {});
            });
        return;
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

    const { disabled_modules } = await GuildConfig.get(message.guild.id);
    if (disabled_modules.indexOf('scamdetection') === -1) {
        if (await new ScamDetection().check(message, bot)) {
            return;
        }
    }
    if (disabled_modules.indexOf('autodelete') === -1) {
        if (await new Autodelete(bot).check(message.channel, message)) {
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
    }

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

module.exports = {
    messageCreate,
};
