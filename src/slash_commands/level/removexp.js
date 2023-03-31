const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
const config = require('../../assets/json/_config/config.json');
const { removexpConfig } = require('../_config/level/removexp');

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
                content: `${config.errormessages.nopermission}`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const user = main_interaction.options.getUser('user');
    const amount = main_interaction.options.getNumber('xp');

    if (user.bot || user.system) {
        return main_interaction
            .followUp({
                content: "❌ You can't remove xp from a bot or a system account.",
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const currentXP = await Levelsystem.gain({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
    });

    if (!currentXP) {
        return main_interaction
            .followUp({
                content:
                    '❌ Something went wrong while fetching the xp. Please contact the Bot support.',
                ephemeral: true,
            })
            .catch((err) => {});
    }

    var newAmount = Number(currentXP) - Number(amount);

    if (newAmount < 0) newAmount = 0;

    const updated = await Levelsystem.update({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
        value: newAmount,
        valueName: 'xp',
    });

    if (updated) {
        return main_interaction
            .followUp({
                content: `✅ ${amount}xp has been removed from ${user}`,
            })
            .catch((err) => {});
    } else {
        return main_interaction
            .followUp({
                content:
                    '❌ Something went wrong while removing the xp. Please contact the Bot support.',
                ephemeral: true,
            })
            .catch((err) => {});
    }
};

module.exports.data = removexpConfig;
