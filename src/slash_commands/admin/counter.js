const Counter = require('../../../utils/functions/data/Counter/Counter');
const { counterConfig, counterPerms } = require('../_config/admin/counter');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true });

    const counterApi = new Counter();

    const channel_id = main_interaction.options.getChannel('channel').id;
    const command = main_interaction.options.getSubcommand();

    const counter = await counterApi.get(main_interaction.guild.id).catch((err) => {
        return main_interaction.followUp({ content: err, ephemeral: true });
    });

    if (command === 'remove') {
        if (!counter) {
            return main_interaction.followUp({
                content: 'Counter does not exist',
                ephemeral: true,
            });
        }

        return await counterApi
            .delete(main_interaction.guild.id)
            .then(() => {
                return main_interaction.followUp({ content: 'Counter removed', ephemeral: true });
            })
            .catch((err) => {
                return main_interaction.followUp({ content: err, ephemeral: true });
            });
    }

    if (counter) {
        return main_interaction.followUp({ content: 'Counter already exists', ephemeral: true });
    }

    return await counterApi
        .create(guild_id, channel_id)
        .then(() => {
            return main_interaction.followUp({ content: 'Counter created', ephemeral: true });
        })
        .catch((err) => {
            return main_interaction.followUp({ content: err, ephemeral: true });
        });
};

module.exports.data = counterConfig;
module.exports.permissions = counterPerms;
