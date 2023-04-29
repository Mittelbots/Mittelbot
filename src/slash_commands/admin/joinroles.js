const { Joinroles } = require('../../../utils/functions/data/Joinroles');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { joinrolesConfig, joinrolesPerms } = require('../_config/admin/joinroles');

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

module.exports.data = joinrolesConfig;
module.exports.permissions = joinrolesPerms;
