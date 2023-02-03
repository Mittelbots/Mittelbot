const { SlashCommandBuilder } = require('discord.js');
const { Warnroles } = require('../../../utils/functions/data/Warnroles');
const { removeMention } = require('../../../utils/functions/removeCharacters');

module.exports.run = async ({ main_interaction, bot }) => {
    const warnroles = removeMention(main_interaction.options.getString('warnroles')).split(' ');
    await Warnroles.update({
        guild: main_interaction.guild,
        roles: warnroles,
        user: bot.guilds.cache
            .get(main_interaction.guild.id)
            .members.cache.get(main_interaction.user.id),
    })
        .then(() => {
            main_interaction
                .reply({
                    content: `✅ Warn Roles updated!`,
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch((err) => {
            main_interaction
                .reply({
                    content: `❌ ${err}`,
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('warnroles')
    .setDescription('Setup warnroles which will apply when a user is warned')
    .addStringOption((warnrole) =>
        warnrole
            .setName('warnroles')
            .setDescription(
                'Add roles. Split multiple roles with a space. To remove a role insert the role.'
            )
            .setRequired(true)
    );
