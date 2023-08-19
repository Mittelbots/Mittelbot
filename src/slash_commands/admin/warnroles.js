const { EmbedBuilder } = require('discord.js');
const Warnroles = require('~utils/classes/Warnroles');
const { removeMention } = require('~utils/functions/removeCharacters');
const { warnRolesConfig, warnRolesPerms } = require('../_config/admin/warnroles');

module.exports.run = async ({ main_interaction, bot }) => {
    const warnroles = removeMention(main_interaction.options.getString('warnroles')).split(' ');
    await new Warnroles()
        .update({
            guild: main_interaction.guild,
            roles: warnroles,
            user: bot.guilds.cache
                .get(main_interaction.guild.id)
                .members.cache.get(main_interaction.user.id),
        })
        .then(() => {
            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['success.admin.warnroles.update'],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.success'])),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
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
                .catch(() => {});
        });
};

module.exports.data = warnRolesConfig;
module.exports.permissions = warnRolesPerms;
