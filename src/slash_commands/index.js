const {
    checkActiveCommand,
} = require('../../utils/functions/checkActiveCommand/checkActiveCommand');
const { GuildConfig } = require('../../utils/functions/data/Config');

module.exports.handleSlashCommands = async ({ main_interaction, bot }) => {
    const admin = [
        'modules',
        'scam',
        'autotranslate',
        'settings',
        'levelsettings',
        'automod',
        'modroles',
        'log',
        'autoblacklist',
        'joinroles',
        'warnroles',
        'reactionroles',
        'autodelete',
        'banappeal',
        'tickets',
    ];
    const moderation = [
        'ban',
        'infractions',
        'isbanned',
        'kick',
        'mute',
        'unban',
        'unmute',
        'purge',
        'warn',
    ];
    const fun = [
        'avatar',
        'ship',
        'guessnumber',
        'cats',
        'dogs',
        'bunny',
        'pride',
        'stromberg',
        'singasong',
    ];
    const level = ['rank', 'leaderboard', 'givexp', 'removexp'];
    const utils = ['afk', 'info', 'ping', 'checkguild', 'kickme', 'timer', 'poll'];
    const help = ['help', 'tutorial'];
    const notifications = ['twitch', 'youtube', 'reddit_notifier'];
    const music = [
        'play',
        'stop',
        'skip',
        'queue',
        'nowplaying',
        'remove',
        'pause',
        'resume',
        'disconnect',
    ];

    //=========================================================

    const guildConfig = await GuildConfig.get(main_interaction.guild.id);
    disabled_modules = guildConfig.disabled_modules;

    function disabled(module) {
        return main_interaction
            .reply({
                content: `❌ This Module (${module}) is disabled.`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    //=========================================================
    const isActive = await checkActiveCommand(
        main_interaction.commandName,
        main_interaction.guild.id
    );

    if (isActive.global_disabled)
        return main_interaction.reply({
            content:
                'This command is currently disabled in all Servers. Join the offical support discord for more informations. https://mittelbot.blackdayz.de/support',
            ephemeral: true,
        });
    if (!isActive.enabled)
        return main_interaction.reply({
            content: 'This command is disabled in your Guild.',
            ephemeral: true,
        });

    //=========================================================

    if (moderation.indexOf(main_interaction.commandName) !== -1) {
        if (disabled_modules.indexOf('moderation') > -1) return disabled('moderation');
        return requireModule('moderation');
    }

    if (fun.indexOf(main_interaction.commandName) !== -1) {
        if (disabled_modules.indexOf('fun') > -1) return disabled('fun');
        return requireModule('fun');
    }

    if (admin.indexOf(main_interaction.commandName) !== -1) {
        if (disabled_modules.indexOf('moderation') > -1) return disabled('moderation');
        return requireModule('admin');
    }

    if (level.indexOf(main_interaction.commandName) !== -1) {
        if (disabled_modules.indexOf('level') > -1) return disabled('level');
        return requireModule('level');
    }

    if (utils.indexOf(main_interaction.commandName) !== -1) {
        if (disabled_modules.indexOf('utils') > -1) return disabled('utils');
        return requireModule('utils');
    }

    if (help.indexOf(main_interaction.commandName) !== -1) {
        if (disabled_modules.indexOf('help') > -1) return disabled('help');
        return requireModule('help');
    }

    if (notifications.indexOf(main_interaction.commandName) !== -1) {
        if (disabled_modules.indexOf('notifications') > -1) return disabled('notifications');
        return requireModule('notifications');
    }

    if (music.indexOf(main_interaction.commandName) !== -1) {
        if (disabled_modules.indexOf('music') > -1) return disabled('music');
        return requireModule('music');
    }

    return require(`./${main_interaction.commandName}/${main_interaction.commandName}`).run({
        main_interaction: main_interaction,
        bot: bot,
    });

    function requireModule(module) {
        return require(`./${module}/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot,
        });
    }
};
