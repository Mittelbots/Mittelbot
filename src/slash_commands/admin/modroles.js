const { ActionRowBuilder, EmbedBuilder, PermissionFlagsBits, ButtonStyle } = require('discord.js');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const { Modroles } = require('../../../utils/functions/data/Modroles');
const config = require('../../assets/json/_config/config.json');
const { modRolesConfig } = require('../_config/admin/modroles');

module.exports.run = async ({ main_interaction, bot }) => {
    if (!main_interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message
            .reply({ content: `${config.errormessages.nopermission}`, ephemeral: true })
            .catch((err) => {});
    }

    const roles = main_interaction.options.getRole('roles');

    const guildConfig = await GuildConfig.get(main_interaction.guild.id);
    const modroles = guildConfig.modroles;

    const dbEntity = modroles.find((x) => x.role === roles.id) || {};
    const serverRole = await main_interaction.guild.roles.fetch(roles.id);

    if (!serverRole)
        return main_interaction.reply({
            content: `❌ The role ${roles} does not exist on this server.`,
            ephemeral: true,
        });

    const modRoleEmbed = new EmbedBuilder().setTitle(
        `Choose setting for _${serverRole.name}_. \n\nCurrent: **${
            dbEntity
                ? dbEntity.isAdmin
                    ? 'Admin'
                    : dbEntity.isMod
                    ? 'Moderator'
                    : dbEntity.isHelper
                    ? 'Helper'
                    : 'Not set yet'
                : 'Not set yet'
        }**`
    );

    const buttons = Modroles.generateButtons();

    const row = new ActionRowBuilder();

    if (!dbEntity.isAdmin) {
        row.addComponents(buttons.isAdmin);
        modRoleEmbed.addFields([
            {
                name: 'Admin Permissions',
                value: 'This role can use commands like ban, unban, etc.',
                inline: true,
            },
        ]);
    }
    if (!dbEntity.isMod) {
        row.addComponents(buttons.isMod);
        modRoleEmbed.addFields([
            {
                name: 'Moderator Permissions',
                value: 'This role can use commands like mute, kick, etc.',
                inline: true,
            },
        ]);
    }
    if (!dbEntity.isHelper) {
        row.addComponents(buttons.isHelper);
        modRoleEmbed.addFields([
            {
                name: 'Helper Permissions',
                value: 'This role can use commands like warn, mute, etc.',
                inline: true,
            },
        ]);
    }

    if (dbEntity.isAdmin || dbEntity.isMod || dbEntity.isHelper) {
        modRoleEmbed.addFields([
            {
                name: 'Remove Role',
                value: 'This role will be removed from the modroles list.',
                inline: true,
            },
        ]);
        row.addComponents(buttons.isRemove);
    }

    const sentMessage = await main_interaction
        .reply({ embeds: [modRoleEmbed], components: [row], ephemeral: true })
        .then((msg) => {
            return msg;
        })
        .catch(() => {
            return false;
        });

    if (!sentMessage) return;

    let returnMessage = '';

    const collector = sentMessage.createMessageComponentCollector({ time: 60000, max: 1 });
    collector.on('collect', async (interaction) => {
        switch (interaction.customId) {
            case 'isAdmin':
                returnMessage = await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: true,
                    isMod: false,
                    isHelper: false,
                });
                buttons.isAdmin.setStyle(ButtonStyle.Success);
                break;
            case 'isMod':
                returnMessage = await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: false,
                    isMod: true,
                    isHelper: false,
                });
                buttons.isMod.setStyle(ButtonStyle.Success);
                break;
            case 'isHelper':
                returnMessage = await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: false,
                    isMod: false,
                    isHelper: true,
                });
                buttons.isHelper.setStyle(ButtonStyle.Success);
                break;
            case 'isRemove':
                returnMessage = await Modroles.remove({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                });
                buttons.isRemove.setStyle(ButtonStyle.Success);
                break;

            default:
                break;
        }

        buttons.isAdmin.setDisabled(true);
        buttons.isMod.setDisabled(true);
        buttons.isHelper.setDisabled(true);
        buttons.isRemove.setDisabled(true);
        interaction.update({
            content: returnMessage,
            components: [row],
        });
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            main_interaction.editReply({
                content: '**Time limit reached**',
                embeds: [modRoleEmbed],
                components: [],
                ephemeral: true,
            });
        }
    });
};

module.exports.data = modRolesConfig;
