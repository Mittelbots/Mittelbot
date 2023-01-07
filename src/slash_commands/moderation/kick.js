const { SlashCommandBuilder } = require('discord.js');
const { kickUser } = require('../../../utils/functions/moderations/kickUser');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: true,
        user: main_interaction.member,
        bot,
    });

    if (!hasPermissions) {
        return main_interaction
            .followUp({
                content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const user = main_interaction.options.getUser('user');

    const check = await checkMessage({
        author: main_interaction.user,
        target: user,
        guild: main_interaction.guild,
        bot,
        type: 'kick',
    });

    if (check)
        return main_interaction
            .followUp({
                content: check,
                ephemeral: true,
            })
            .catch((err) => {});

    let reason = main_interaction.options.getString('reason') || 'No reason provided';

    kickUser({ user, mod: main_interaction.user, guild: main_interaction.guild, reason, bot })
        .then((res) => {
            main_interaction
                .followUp({
                    embeds: [res.message],
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch((err) => {
            main_interaction
                .followUp({
                    content: err,
                    ephemeral: true,
                })
                .catch((err) => {});
        });
    return;
};

module.exports.data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption((option) =>
        option.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the ban').setRequired(false)
    );
