const { EmbedBuilder } = require('discord.js');

module.exports = class Tutorial {
    constructor(main_interaction, bot) {
        this.main_interaction = main_interaction;
        this.bot = bot;
        this.embeds = new EmbedBuilder();
        this.run();
    }

    run() {
        const topic = this.main_interaction.values[0];

        switch (topic) {
            case 'commands':
                this.commands();
                break;
            case 'permissions':
                this.permissions();
                break;
            case 'notifications':
                this.notifications();
                break;
            case 'level':
                this.level();
                break;
            case 'moderation':
                this.moderation();
                break;
            case 'automod':
                this.automod();
                break;
            case 'scam':
                this.scam();
                break;
            default:
                this.main_interaction
                    .reply({
                        content: '**WTF! This topic does not even exists!?**',
                        ephemeral: true,
                    })
                    .catch((err) => {});
        }
    }

    send() {
        this.main_interaction
            .update({
                embeds: [this.embeds],
            })
            .catch((err) => {});
    }

    commands() {
        this.embeds
            .setTitle('Slash Commands')
            .setDescription(
                `Slash Commands are the main way to interact with the Bot.\nYou can use them by typing \`/\` in any channel.\nYou can also use them in DMs.\nYou can request more slash commands in the official discord support server https://mittelbot.xyz/support`
            )
            .setImage(
                `https://raw.githubusercontent.com/RileyAbr/rat-facts-Discord-Bot/main/assets/rat%20facts%20clip.gif`
            );

        this.send();
    }

    permissions() {
        this.embeds
            .setTitle('Permissions')
            .setDescription(
                `
                    You can set permissions for each role in the server.\n
                    Each layer has its own permissions and **every layer over gets the permissions from below**.\n
                    To setup the permissions you can use the \`/modroles\` command.

                    **Example:**
                `
            )
            .addFields([
                {
                    name: 'Admin Permissions',
                    value: `Does have the permission to use the \`/settings\` command.`,
                },
                {
                    name: 'Moderator Permissions',
                    value: `Does have the permission to use the \`/ban\` command.`,
                },
                {
                    name: 'Helper Permissions',
                    value: `Does have the permission to use the \`/warn\` command.`,
                },
            ]);

        this.send();
    }

    notifications() {
        this.embeds.setTitle('Notifications (YouTube, Twitch, and Reddit)').setDescription(
            `
                    You can setup notifications for YouTube, Twitch and Reddit.\n
                    To setup the notifications you can use the \`/youtube\`, \`/twitch\` and \`/reddit\` command.
                `
        );
        this.send();
    }

    level() {
        this.embeds
            .setTitle('Level System')
            .setDescription(
                `
                    You can view your level and rank by using the \`/level\` command.\n
                    With the \`/leaderboard\` command you can also view the top 10 users in the server.

                    Did you know you can choose between 3 different difficulty levels?
                    \`Easy\`, \`Normal\` and \`Hard\`.\n
                `
            )
            .addFields([
                {
                    name: 'Easy',
                    value: `The levels are easier to reach.`,
                },
                {
                    name: 'Normal',
                    value: `Everything is balanced. It's not too easy and not too hard.`,
                },
                {
                    name: 'Hard',
                    value: `The levels are harder to reach.`,
                },
            ]);
        this.send();
    }

    moderation() {
        this.embeds.setTitle('Moderation').setDescription(
            `
                    You can use commands like \`/ban\`, \`/kick\`, \`/mute\`, \`/unmute\`, \`/warn\` command.\n
                    All infrations will be saved in the database and you can view them with the \`/infractions\` command.\n 
                `
        );
        this.send();
    }

    automod() {
        this.embeds.setTitle('Automod').setDescription(
            `
                    The bot has a built-in automod system.\n
                    It will automatically delete messages that contain bad words or links and sent too fast messages.\n
                    To activate it you can use the \`/automod\` command.\n
                `
        );
        this.send();
    }

    scam() {
        this.embeds.setTitle('Scam Protection').setDescription(
            `
                    The bot has a built-in scam protection system.\n
                    It will automatically delete messages that contain scam links.\n
                    You can always submit a scam link to the official community database with the \`/scam\` command.\n
                    Or you can use the same command to submit a whitelist request.\n
                `
        );
        this.send();
    }
};
