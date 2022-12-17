const {
    ActionRowBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    ButtonStyle,
} = require('discord.js');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const { Modroles } = require('../../../utils/functions/data/Modroles');
const config = require('../../assets/json/_config/config.json');

module.exports.run = async ({ main_interaction, bot }) => {
    if (!main_interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message
            .reply({ content: `${config.errormessages.nopermission}`, ephemeral: true })
            .catch((err) => {});
    }

    const roles = main_interaction.options.getRole('roles');

    const guildConfig = await GuildConfig.get(main_interaction.guild.id);
    const modroles = guildConfig.modroles

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

    switch (true) {
        case !dbEntity.isAdmin:
            row.addComponents(buttons.isAdmin);
        case !dbEntity.isMod:
            row.addComponents(buttons.isMod);
        case !dbEntity.isHelper:
            row.addComponents(buttons.isHelper);
    }

    if (dbEntity.isAdmin || dbEntity.isMod || dbEntity.isHelper) {
        row.addComponents(buttons.isRemove);
    }

    switch (true) {
        case !dbEntity.isAdmin:
            modRoleEmbed.addFields([
                {
                    name: 'Admin Permissions',
                    value: 'This role can use commands like ban, unban, etc.',
                    inline: true,
                },
            ]);
        case !dbEntity.isMod:
            modRoleEmbed.addFields([
                {
                    name: 'Moderator Permissions',
                    value: 'This role can use commands like mute, kick, etc.',
                    inline: true,
                },
            ]);
        case !dbEntity.isHelper:
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
    }

    const sentMessage = await main_interaction
        .reply({ embeds: [modRoleEmbed], components: [row], ephemeral: true })
        .then((msg) => {
            return msg;
        })
        .catch((err) => {
            return false;
        });

    if (!sentMessage) return;

    const collector = sentMessage.createMessageComponentCollector({ time: 60000, max: 1 });

    collector.on('collect', async (interaction) => {
        switch (interaction.customId) {
            case 'isAdmin':
                await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: true,
                    isMod: false,
                    isHelper: false,
                });
                buttons.isAdmin.setStyle(ButtonStyle.Success);
                break;
            case 'isMod':
                await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: false,
                    isMod: true,
                    isHelper: false,
                });
                buttons.isMod.setStyle(ButtonStyle.Success);
                break;
            case 'isHelper':
                await Modroles.update({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: false,
                    isMod: false,
                    isHelper: true,
                });
                buttons.isHelper.setStyle(ButtonStyle.Success);
                break;
            case 'isRemove':
                await Modroles.remove({
                    guild_id: main_interaction.guild.id,
                    role_id: roles.id,
                    isAdmin: false,
                    isMod: false,
                    isHelper: false,
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

module.exports.data = new SlashCommandBuilder()
    .setName('modroles')
    .setDescription('Add Modroles to be able to use the moderation commands')
    .addRoleOption((option) =>
        option
            .setName('roles')
            .setDescription('Add a role to be able to use the moderation commands')
            .setRequired(true)
    );
