const { guildCreate } = require('../events/guildCreate');
const { guildMemberAdd } = require('../events/guildMemberAdd');
const { guildMemberRemove } = require('../events/guildMemberRemove');
const { interactionCreate } = require('../events/interactionCreate');
const { messageCreate } = require('../events/messageCreate');
const { messageDelete } = require('../events/messageDelete');
const { channelCreate } = require('../events/channelCreate');
const { channelDelete } = require('../events/channelDelete');
const { channelUpdate } = require('../events/channelUpdate');
const { botDebug } = require('../events/botDebug');
const { guildUpdate } = require('../events/guildUpdate');
const { messageDeleteBulk } = require('../events/messageDeleteBulk');
const { messageUpdate } = require('../events/messageUpdate');
const { roleCreate } = require('../events/roleCreate');
const { roleDelete } = require('../events/roleDelete');
const { roleUpdate } = require('../events/roleUpdate');
const { guildBanAdd } = require('../events/guildBanAdd');
const { guildBanRemove } = require('../events/guildBanRemove');
const { botError } = require('../events/botError');
const { botDisconnect } = require('../events/botDisconnect');
const { botWarn } = require('../events/botWarn');
const { rateLimit } = require('../events/rateLimit');
const { handleAddedReactions } = require('~utils/functions/data/reactionroles');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { guildMemberNicknameUpdate } = require('../events/guildMemberNicknameUpdate');
const { guildMemberRoleAdd } = require('../events/guildMemberRoleAdd');
const { guildMemberRoleRemove } = require('../events/guildMemberRoleRemove');
const { guildBoostLevelUp } = require('../events/guildBoostLevelUp');
const { guildBoostLevelDown } = require('../events/guildBoostLevelDown');
const { guildBannerAdd } = require('../events/guildBannerAdd');
const { guildVanityURLAdd } = require('../events/guildVanityURLAdd');
const { guildAfkChannelAdd } = require('../events/guildAfkChannelAdd');
const { guildVanityURLUpdate } = require('../events/guildVanityURLUpdate');
const { guildOwnerUpdate } = require('../events/guildOwnerUpdate');
const { guildPartnerAdd } = require('../events/guildPartnerAdd');
const { guildPartnerRemove } = require('../events/guildPartnerRemove');
const { guildVerificationAdd } = require('../events/guildVerificationAdd');
const { guildVerificationRemove } = require('../events/guildVerificationRemove');
const { guildMemberOffline } = require('../events/guildMemberOffline');
const { guildMemberOnline } = require('../events/guildMemberOnline');
const { userAvatarUpdate } = require('../events/userAvatarUpdate');
const { userUsernameUpdate } = require('../events/userUsernameUpdate');
const { guildVanityURLRemove } = require('../events/guildVanityURLRemove');
const { autoModerationRuleCreate } = require('../events/autoModerationRuleCreate');
const { autoModerationRuleDelete } = require('../events/autoModerationRuleDelete');
const { autoModerationRuleUpdate } = require('../events/autoModerationRuleUpdate');
const { guildDelete } = require('../events/guildDelete');

module.exports.acceptBotInteraction = (bot) => {
    bot.on('guildCreate', async (guild) => {
        guildCreate(guild, bot);
    });

    bot.on('guildDelete', async (guild) => {
        guildDelete(guild);
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
        guildMemberOffline(bot, member, oldStatus);
    });

    bot.on('guildMemberOnline', (member, oldStatus) => {
        guildMemberOnline(bot, member, oldStatus);
    });

    bot.on('userAvatarUpdate', (user, oldAvatarURL, newAvatarURL) => {
        userAvatarUpdate(bot, user, oldAvatarURL, newAvatarURL);
    });

    bot.on('userUsernameUpdate', (user, oldUsername, newUsername) => {
        userUsernameUpdate(bot, user, oldUsername, newUsername);
    });

    bot.on('autoModerationRuleCreate', (rule) => {
        autoModerationRuleCreate(bot, rule);
    });

    bot.on('autoModerationRuleDelete', (rule) => {
        autoModerationRuleDelete(bot, rule);
    });

    bot.on('autoModerationRuleUpdate', (oldRule, newRule) => {
        autoModerationRuleUpdate(bot, oldRule, newRule);
    });
};
