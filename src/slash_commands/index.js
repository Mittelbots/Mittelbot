const {
    checkActiveCommand,
} = require('../../utils/functions/checkActiveCommand/checkActiveCommand');
const Modules = require('../../utils/functions/data/Modules');

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

    function isEnabled(requestedModule) {
        return new Promise(async (resolve) => {
            const moduleApi = new Modules(main_interaction.guild.id, bot);
            const enabled = await moduleApi.checkEnabled(requestedModule).catch(() => {
                return false;
            });

            if (!enabled) {
                main_interaction
                    .reply({
                        content: `❌ This Module (${requestedModule}) is disabled.`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
                resolve(false);
            }

            resolve(true);
        });
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
        if (!(await isEnabled('moderation'))) return;
        return requireModule('moderation');
    }

    if (fun.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled('fun'))) return;
        return requireModule('fun');
    }

    if (admin.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(main_interaction.commandName))) return;
        return requireModule('admin');
    }

    if (level.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled('level'))) return;
        return requireModule('level');
    }

    if (utils.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled('utils'))) return;
        return requireModule('utils');
    }

    if (help.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled('help'))) return;
        return requireModule('help');
    }

    if (notifications.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(main_interaction.commandName))) return;
        return requireModule('notifications');
    }

    if (music.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled('music'))) return;
        return requireModule('music');
    }

    return require(`./${main_interaction.commandName}/${main_interaction.commandName}`).run({
        main_interaction: main_interaction,
        bot: bot,
    });

    function requireModule(requestedModule) {
        return require(`./${requestedModule}/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot,
        });
    }
};
