const {
    handleSlashCommands
} = require('../src/slash_commands');
const {
    manageNewWelcomeSetting
} = require('../utils/functions/data/welcomechannel');
const config = require('../src/assets/json/_config/config.json');
const {
    GuildConfig
} = require('../utils/functions/data/Config');
const {
    InteractionType
} = require('discord.js');
const {
    manageScam
} = require('../utils/functions/data/scam');
const {
    errorhandler
} = require('../utils/functions/errorhandler/errorhandler');
const {
    Afk
} = require('../utils/functions/data/Afk');
const {
    GlobalConfig
} = require('../utils/functions/data/GlobalConfig');

const defaultCooldown = new Set();

module.exports.interactionCreate = async ({
    main_interaction,
    bot
}) => {
    if (main_interaction.user.bot || main_interaction.user.system) return;
    const {
        ignoreMode
    } = await GlobalConfig.get() || 0;
    if (ignoreMode) {
        if (main_interaction.user.id !== config.Bot_Owner_ID) {
            return main_interaction.react('🕒').catch((err) => {});
        }
        return main_interaction
            .reply({
                content: 'Sorry, I am currently in ignore mode. Join the support server to get more information https://blackdayz.de/mittelbot/support.',
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const guildConfig = await GuildConfig.get(main_interaction.guild.id);
    main_interaction.bot = bot;
    if (main_interaction.type === InteractionType.ApplicationCommand) {
        if (defaultCooldown.has(main_interaction.user.id)) {
            errorhandler({
                fatal: false,
                message: `${main_interaction.user.username} is on slash command cooldown.`,
            });

            return main_interaction
                .reply({
                    content: `You have to wait ${
                            guildConfig.cooldown / 1000 + 's' || config.defaultCooldown.text
                        } after each Command.`,
                    ephemeral: true,
                })
                .catch((err) => {});
        } else {
            defaultCooldown.add(main_interaction.user.id);
            setTimeout(async () => {
                defaultCooldown.delete(main_interaction.user.id);
            }, guildConfig.cooldown || config.defaultCooldown.format);

            return handleSlashCommands({
                main_interaction,
                bot,
            });
        }
    } else if (main_interaction.type === InteractionType.ModalSubmit) {
        if (main_interaction.customId == 'afk_modal') {
            Afk.handle(main_interaction);
        }
    } else {
        switch (main_interaction.customId) {
            case 'welcomemessage':
                await main_interaction.deferUpdate();
                manageNewWelcomeSetting({
                    main_interaction,
                });
                break;
        }

        if (main_interaction.customId.indexOf('scam') === 0) {
            manageScam({
                    main_interaction
                })
                .then((res) => {
                    main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
        }
    }
};