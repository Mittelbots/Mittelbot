const { handleSlashCommands } = require('../../src/slash_commands');
const { manageNewWelcomeSetting } = require('../../utils/functions/data/welcomechannel');
const config = require('../../src/assets/json/_config/config.json');
const { GuildConfig } = require('../../utils/functions/data/Config');
const { InteractionType } = require('discord.js');
const { manageScam } = require('../../utils/functions/data/scam');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');
const Afk = require('../../utils/functions/data/Afk');
const { GlobalConfig } = require('../../utils/functions/data/GlobalConfig');
const pride = require('../../src/slash_commands/fun/pride');
const Tutorial = require('../../utils/functions/data/Tutorial');
const SingASong = require('../../utils/functions/data/SingASong');
const Banappeal = require('../../utils/functions/data/Banappeal');
const Tickets = require('../../utils/functions/data/Tickets/Tickets');
const { EmbedBuilder } = require('discord.js');
const Hangman = require('../../utils/functions/data/Games/Hangman/Hangman');

const defaultCooldown = new Set();

module.exports.interactionCreate = async ({ main_interaction, bot }) => {
    main_interaction.bot = bot;

    if (
        bot.user.id === '921779661795639336' &&
        main_interaction.user.id !== bot.ownerId &&
        main_interaction.user.id !== bot.testAcc
    ) {
        return main_interaction.reply({
            content: 'Sorry, but this bot is in development and only the owner can use it.',
            ephemeral: true,
        });
    }

    if (main_interaction.user.bot || main_interaction.user.system) return;
    const { ignoreMode } = (await GlobalConfig.get()) || 0;
    if (ignoreMode) {
        if (main_interaction.user.id !== bot.owner) {
            return main_interaction.react('🕒').catch((err) => {});
        }
        return main_interaction
            .reply({
                content:
                    'Sorry, I am currently in ignore mode. Join the support server to get more information https://blackdayz.de/mittelbot/support.',
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
            new Afk().handle(main_interaction);
        }
    } else if (main_interaction.type === InteractionType.ApplicationCommandAutocomplete) {
        const command = await bot.commands.find(
            (cmd) => cmd.data.name === main_interaction.commandName
        );
        return command.autocomplete(main_interaction);
    } else {
        switch (main_interaction.customId) {
            case 'welcomemessage':
                await main_interaction.deferUpdate();
                manageNewWelcomeSetting({
                    main_interaction,
                }).catch((err) => {});
                break;
            case 'pride_forward':
                await main_interaction.deferUpdate();
                pride.functions.manageButtons(main_interaction);
                break;
            case 'pride_backward':
                await main_interaction.deferUpdate();
                pride.functions.manageButtons(main_interaction);
                break;
            case 'tutorial':
                new Tutorial(main_interaction, bot);
                break;
            case 'hangman_cancel':
                new Hangman(main_interaction, bot).cancel();
                break;
        }

        if (main_interaction.customId.indexOf('scam') === 0) {
            manageScam({
                main_interaction,
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

        if (main_interaction.customId.indexOf('singasong_finish') === 0) {
            new SingASong(main_interaction, bot).interaction();
        }
        if (main_interaction.customId.indexOf('singasong_upvote') === 0) {
            new SingASong(main_interaction, bot).interaction();
        }
        if (main_interaction.customId.indexOf('singasong_cancel') === 0) {
            new SingASong(main_interaction, bot).interaction();
        }
        if (main_interaction.customId.indexOf('ticket') !== -1) {
            new Tickets(bot, main_interaction)
                .interacte()
                .then((res) => {
                    if (!res) return;

                    main_interaction
                        .reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(res)
                                    .setColor(global.t.trans(['general.colors.success'])),
                            ],
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(err)
                                    .setColor(global.t.trans(['general.colors.error'])),
                            ],
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
        }
        if (main_interaction.customId.indexOf('banappeal') === 0) {
            new Banappeal(bot).manageBanappeal(main_interaction);
        }
    }
};
