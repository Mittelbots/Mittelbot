const { guildCreate } = require('../guildCreate');
const { guildMemberAdd } = require('../guildMemberAdd');
const { guildMemberRemove } = require('../guildMemberRemove');
const { interactionCreate } = require('../interactionCreate');
const { messageCreate } = require('../messageCreate');
const { messageDelete } = require('../messageDelete');
const { channelCreate } = require('../channelCreate');
const { channelDelete } = require('../channelDelete');
const { channelUpdate } = require('../channelUpdate');
const { botDebug } = require('../botDebug');
const { guildUpdate } = require('../guildUpdate');
const { messageDeleteBulk } = require('../messageDeleteBulk');
const { messageUpdate } = require('../messageUpdate');
const { roleCreate } = require('../roleCreate');
const { roleDelete } = require('../roleDelete');
const { roleUpdate } = require('../roleUpdate');
const { guildBanAdd } = require('../guildBanAdd');
const { guildBanRemove } = require('../guildBanRemove');
const { botError } = require('../botError');
const { botDisconnect } = require('../botDisconnect');
const { botWarn } = require('../botWarn');
const { rateLimit } = require('../rateLimit');
const { handleAddedReactions } = require('../../utils/functions/data/reactionroles');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');
const { guildMemberNicknameUpdate } = require('../ext_events/guildMemberNicknameUpdate');
const { guildMemberRoleAdd } = require('../ext_events/guildMemberRoleAdd');
const { guildMemberRoleRemove } = require('../ext_events/guildMemberRoleRemove');
const { guildBoostLevelUp } = require('../ext_events/guildBoostLevelUp');
const { guildBoostLevelDown } = require('../ext_events/guildBoostLevelDown');
const { guildBannerAdd } = require('../ext_events/guildBannerAdd');
const { guildVanityURLAdd } = require('../ext_events/guildVanityURLAdd');
const { guildAfkChannelAdd } = require('../ext_events/guildAfkChannelAdd');
const { guildVanityURLUpdate } = require('../ext_events/guildVanityURLUpdate');
const { guildOwnerUpdate } = require('../ext_events/guildOwnerUpdate');
const { guildPartnerAdd } = require('../ext_events/guildPartnerAdd');
const { guildPartnerRemove } = require('../ext_events/guildPartnerRemove');
const { guildVerificationAdd } = require('../ext_events/guildVerificationAdd');
const { guildVerificationRemove } = require('../ext_events/guildVerificationRemove');
const { guildMemberOffline } = require('../ext_events/guildMemberOffline');
const { guildMemberOnline } = require('../ext_events/guildMemberOnline');
const { userAvatarUpdate } = require('../ext_events/userAvatarUpdate');
const { userUsernameUpdate } = require('../ext_events/userUsernameUpdate');
const { guildVanityURLRemove } = require('../ext_events/guildVanityURLRemove');

module.exports.acceptBotInteraction = (bot) => {
    bot.on('guildCreate', async (guild) => {
        guildCreate(guild, bot);
    });

    bot.on('guildMemberAdd', (member) => {
        guildMemberAdd(member, bot);
    });

    bot.on('guildMemberRemove', (member) => {
        guildMemberRemove({
            member,
        });
    });

    bot.on('messageCreate', (message) => {
        messageCreate(message, bot);
    });

    bot.on('messageReactionAdd', (reaction, user) => {
        handleAddedReactions({
            reaction,
            user,
            bot,
        });
    });

    bot.on('messageReactionRemove', (reaction, user) => {
        handleAddedReactions({
            reaction,
            user,
            bot,
            remove: true,
        });
    });

    bot.on('interactionCreate', (main_interaction) => {
        interactionCreate({
            main_interaction,
            bot,
        });
    });

    bot.on('rateLimit', (rateLimitData) => {
        rateLimit({ rateLimitData });
    });

    bot.on('debug', (info) => {
        if (info.substr(6, 3) === '429') {
            rateLimit({ rateLimitData: info });
        }
        if (info.includes('401')) {
            errorhandler({
                message: info,
                fatal: true,
            });
        }
        botDebug(bot, info);
    });

    bot.on('messageDelete', (message) => {
        messageDelete(bot, message);
    });

    bot.on('messageDeleteBulk', (messages) => {
        messageDeleteBulk(bot, messages);
    });

    bot.on('messageUpdate', (messageBefore, messageAfter) => {
        messageUpdate(bot, messageBefore, messageAfter);
    });

    bot.on('channelCreate', (channel) => {
        channelCreate(bot, channel);
    });

    bot.on('channelDelete', (channel) => {
        channelDelete(bot, channel);
    });

    bot.on('channelUpdate', (channelBefore, channelAfter) => {
        channelUpdate(bot, channelBefore, channelAfter);
    });

    bot.on('disconnect', (event) => {
        botDisconnect(bot, event);
    });

    bot.on('error', (error) => {
        botError(bot, error);
    });

    bot.on('warn', (warn) => {
        botWarn(bot, warn);
    });

    bot.on('guildUpdate', (guildBefore, guildAfter) => {
        guildUpdate(bot, guildBefore, guildAfter);
    });

    bot.on('roleCreate', (role) => {
        roleCreate(bot, role);
    });

    bot.on('roleDelete', (role) => {
        roleDelete(bot, role);
    });

    bot.on('roleUpdate', (roleBefore, roleAfter) => {
        roleUpdate(bot, roleBefore, roleAfter);
    });

    bot.on('guildBanAdd', (guildBan) => {
        guildBanAdd(bot, guildBan);
    });

    bot.on('guildBanRemove', (guildBan) => {
        guildBanRemove(bot, guildBan);
    });

    /** EXTERNAL EVENTS */

    //! DONT WORK
    bot.on('guildMemberNicknameUpdate', (member, oldNickname, newNickname) => {
        guildMemberNicknameUpdate(bot, member, oldNickname, newNickname);
    });

    //! DONT WORK
    bot.on('guildMemberRoleAdd', (member, role) => {
        guildMemberRoleAdd(bot, member, role);
    });

    //! DONT WORK
    bot.on('guildAfkChannelAdd', (guild, afkChannel) => {
        guildAfkChannelAdd(bot, guild, afkChannel);
    });

    bot.on('guildMemberRoleRemove', (member, role) => {
        guildMemberRoleRemove(bot, member, role);
    });

    bot.on('guildBoostLevelUp', (guild, oldLevel, newLevel) => {
        guildBoostLevelUp(bot, guild, oldLevel, newLevel);
    });

    bot.on('guildBoostLevelDown', (guild, oldLevel, newLevel) => {
        guildBoostLevelDown(bot, guild, oldLevel, newLevel);
    });

    bot.on('guildBannerAdd', (guild, bannerURL) => {
        guildBannerAdd(bot, guild, bannerURL);
    });

    bot.on('guildVanityURLAdd', (guild, vanityURL) => {
        guildVanityURLAdd(bot, guild, vanityURL);
    });

    bot.on('guildVanityURLRemove', (guild, vanitURL) => {
        guildVanityURLRemove(bot, guild, vanitURL);
    });

    bot.on('guildVanityURLUpdate', (guild, oldVanityURL, newVanityURL) => {
        guildVanityURLUpdate(bot, guild, oldVanityURL, newVanityURL);
    });

    bot.on('guildOwnerUpdate', (oldGuild, newGuild) => {
        guildOwnerUpdate(bot, oldGuild, newGuild);
    });

    bot.on('guildPartnerAdd', (guild) => {
        guildPartnerAdd(bot, guild);
    });

    bot.on('guildPartnerRemove', (guild) => {
        guildPartnerRemove(bot, guild);
    });

    bot.on('guildVerificationAdd', (guild) => {
        guildVerificationAdd(bot, guild);
    });

    bot.on('guildVerificationRemove', (guild) => {
        guildVerificationRemove(bot, guild);
    });

    bot.on('guildMemberOffline', (member, oldStatus) => {
        guildMemberOffline(bot, member);
    });

    bot.on('guildMemberOnline', (member, oldStatus) => {
        guildMemberOnline(bot, member);
    });

    bot.on('userAvatarUpdate', (user, oldAvatarURL, newAvatarURL) => {
        userAvatarUpdate(bot, user, oldAvatarURL, newAvatarURL);
    });

    bot.on('userUsernameUpdate', (user, oldUsername, newUsername) => {
        userUsernameUpdate(bot, user, oldUsername, newUsername);
    });
};
