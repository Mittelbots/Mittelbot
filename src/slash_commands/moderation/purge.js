const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const { delay } = require('../../../utils/functions/delay/delay');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { hasPermission } = require('../../../utils/functions/hasPermissions');

module.exports.run = async ({ main_interaction, bot }) => {
    main_interaction.deferReply();

    var hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: false,
        user: main_interaction.member,
        bot,
    });

    if (!hasPermissions) {
        return main_interaction
            .followUp({
                content: `${config.errormessages.nopermission}`,
            })
            .catch((err) => {});
    }

    const amount = main_interaction.options.getNumber('number');

    if (amount < 1 || amount >= Number(config.bulkDeleteLimit)) {
        return main_interaction
            .followUp({
                content: `You need to input a number between 1 and ${config.bulkDeleteLimit}.`,
            })
            .catch((err) => {});
    }
    await main_interaction.channel
        .bulkDelete(amount, true)
        .then(() => {
            main_interaction
                .followUp({
                    content: `Successfully pruned ${amount} messages`,
                })
                .then(async (msg) => {
                    await delay(3000);
                    msg.delete().catch((err) => {});
                })
                .catch((err) => {});
        })
        .catch((err) => {
            errorhandler({ err });
            main_interaction
                .followUp({
                    content: `There was an error trying to prune messages in this channel! (I can only delete messages younger then 14 Days!)`,
                })
                .catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge a number of messages from a channel')
    .addNumberOption((option) =>
        option.setName('number').setRequired(true).setDescription('The number of message to delete')
    );
// .addUserOption(option =>
//     option.setName('user')
//     .setDescription('The user to purge')
//     .setRequired(true)
// )
