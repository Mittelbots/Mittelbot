const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
    sendWelcomeSetting,
    updateWelcomeSettings,
} = require('../../../utils/functions/data/welcomechannel');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const config = require('../../../src/assets/json/_config/config.json');
const { EmbedBuilder } = require('discord.js');
module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hasPermission = await main_interaction.member.permissions.has(
        PermissionFlagsBits.Administrator
    );
    if (!hasPermission) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.permissions.user.useCommand'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    switch (main_interaction.options.getSubcommand()) {
        case 'view':
            return main_interaction
                .reply({
                    content: 'This command is currenty disabled',
                    ephemeral: true,
                })
                .catch((err) => {});
            break;

        case 'welcomemessage':
            await updateWelcomeSettings({
                guild_id: main_interaction.guild.id,
                valueName: 'id',
                value: main_interaction.options.getChannel('channel').id,
            })
                .then(() => {
                    sendWelcomeSetting({
                        main_interaction,
                    });
                })
                .catch((err) => {
                    main_interaction
                        .followUp({
                            content: '❌ ' + err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;

        case 'cooldown':
            const cooldown = main_interaction.options.getNumber('cooldown');
            if (cooldown < 1) {
                await saveSetting({
                    value: 0,
                    valueName: 'cooldown',
                });
                main_interaction
                    .followUp({
                        content: `✅ Command Cooldown successfully turned off \n \n**Info: A default Cooldown of 2 Seconds is still enabled to protect the bot from spam!**`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            } else {
                await saveSetting({
                    value: cooldown * 1000,
                    valueName: 'cooldown',
                });
                main_interaction
                    .followUp({
                        content: `✅ Command Cooldown successfully changed to ${cooldown} seconds \n \n**Info: Cooldown can be interupted when the bot is offline!**`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }
            break;
    }

    async function saveSetting({ value, valueName }) {
        await GuildConfig.update({
            guild_id: main_interaction.guild.id,
            value,
            valueName,
        });
    }
};

module.exports.data = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('All important settings which you can set, edit or remove.')
    .addSubcommand((command) => command.setName('view').setDescription('View all of your settings'))
    .addSubcommand((command) =>
        command
            .setName('welcomemessage')
            .setDescription('Set the welcome message and channel.')
            .addChannelOption((channel) =>
                channel
                    .setName('channel')
                    .setDescription('The channel you want to set as welcome channel.')
                    .setRequired(true)
            )
    )
    .addSubcommand((command) =>
        command
            .setName('cooldown')
            .setDescription('Set the cooldown for your Guild.')
            .addNumberOption((cooldown) =>
                cooldown
                    .setName('cooldown')
                    .setDescription('The cooldown you want to set. (in seconds)')
                    .setRequired(true)
            )
    );
