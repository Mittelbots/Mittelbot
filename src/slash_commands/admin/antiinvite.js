const { EmbedBuilder } = require('discord.js');
const { Automod } = require('../../../utils/functions/data/Automod');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { antiInviteConfig, antiInvitePerms } = require('../_config/admin/antiinvite');

module.exports.run = async ({ main_interaction, bot }) => {
    const setting = await Automod.get(main_interaction.guild.id);
    const antiInviteEnabled = JSON.parse(main_interaction.options.getString('enabled'));
    const antiInviteAction = main_interaction.options.getString('action');

    setting.antiinvite = {
        enabled: antiInviteEnabled,
        action: antiInviteAction,
    };

    Automod.update({
        guild_id: main_interaction.guild.id,
        value: setting,
        type: setting.antiinvite.action,
    })
        .then((res) => {
            const description = setting.antiinvite.enabled
                ?  global.t.trans(
                    ['success.automod.antiinvite.enabled', antiInviteAction],
                    main_interaction.guild.id
                );
                : global.t.trans(
                    ['success.automod.antiinvite.disabled'],
                    main_interaction.guild.id
                );

            main_interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(description)
                        .setColor(
                            global.t.trans(['general.colors.success'])
                        )
                ],
                ephemeral: true,
            }).catch((err) => {});
        })
        .catch((err) => {
            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.generalWithMessage', err.message],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });

};

module.exports.data = antiInviteConfig;
module.exports.permissions = antiInvitePerms;

