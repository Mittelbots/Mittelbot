const { EmbedBuilder } = require('discord.js');
const { Automod } = require('../../../utils/functions/data/Automod');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { antiLinksConfig, antiLinksPerms } = require('../_config/admin/antilinks');

module.exports.run = async ({ main_interaction, bot }) => {
    const guildId = main_interaction.guild.id;
    const antilinksEnabled = JSON.parse(main_interaction.options.getString('enabled'));
    const antilinksAction = main_interaction.options.getString('action');

    let setting = await Automod.get(guildId, 'antilinks');
    setting = {
        enabled: antilinksEnabled,
        action: antilinksAction,
    };

    Automod.update({
        guild_id: guildId,
        value: setting,
        type: 'antilinks',
    })
        .then(() => {
            const description = antilinksEnabled
                ? global.t.trans(['success.automod.antilinks.enabled', antilinksAction], guildId)
                : global.t.trans(['success.automod.antilinks.disabled'], guildId);

            main_interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(description)
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
                ephemeral: true,
            });
        })
        .catch((err) => {
            main_interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['error.generalWithMessage', err.message], guildId)
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            });
        });
};

module.exports.data = antiLinksConfig;
module.exports.permissions = antiLinksPerms;
