const { SlashCommandBuilder } = require('discord.js');
const { Joinroles } = require('../../../utils/functions/data/Joinroles');
const { removeMention } = require('../../../utils/functions/removeCharacters');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const roles = main_interaction.options.getString('joinroles');
    const newJoinRoles = removeMention(roles).split(' ');
    Joinroles.update({
        guild: main_interaction.guild,
        roles: newJoinRoles,
        user: bot.guilds.cache
            .get(main_interaction.guild.id)
            .members.cache.get(main_interaction.user.id),
    })
        .then((res) => {
            main_interaction
                .followUp({
                    content: `✅ ${res}`,
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch((err) => {
            main_interaction
                .followUp({
                    content: `❌ ${err}`,
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('joinroles')
    .setDescription(
        'Add joinroles to your server. Note: If you mention a existing role, it will be removed'
    )
    .addStringOption((joinrole) =>
        joinrole
            .setName('joinroles')
            .setDescription(
                'Add roles to the list of join roles. Split multiple roles with a space.'
            )
            .setRequired(true)
    );
