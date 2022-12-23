const { SlashCommandBuilder } = require('discord.js');
const { changeYtNotifier, delYTChannelFromList } = require('../../../utils/functions/data/youtube');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const type = main_interaction.options.getSubcommand();
    if (type === 'add') {
        const ytchannel = main_interaction.options.getString('ytchannel');
        const dcchannel = main_interaction.options.getChannel('dcchannel');
        const pingrole = main_interaction.options.getRole('ytping');

        changeYtNotifier({
            ytchannel,
            dcchannel,
            pingrole,
            guild: await bot.guilds.cache.get(main_interaction.guild.id),
        })
            .then((res) => {
                main_interaction.followUp({
                    content: res,
                    ephemeral: true,
                });
            })
            .catch((err) => {
                main_interaction.followUp({
                    content: err,
                    ephemeral: true,
                });
            });
    } else {
        delYTChannelFromList({
            guild_id: main_interaction.guild.id,
        })
            .then(() => {
                main_interaction
                    .followUp({
                        content:
                            '✅ Successfully removed the youtube channel from the notification list. Now you can add a new one.',
                        ephemeral: true,
                    })
                    .catch((err) => {});
            })
            .catch(() => {
                main_interaction
                    .followUp({
                        content:
                            '❌ Something went wrong while removing the channel from the database. Please contact the Bot support.',
                        ephemeral: true,
                    })
                    .catch((err) => {});
            });
    }
};

module.exports.data = new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Setup the youtube notifier')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a youtube channel to follow')
            .addStringOption((option) =>
                option
                    .setName('ytchannel')
                    .setDescription(
                        'Insert here your youtube name. Example: Mittelblut9 (without @)'
                    )
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('dcchannel')
                    .setDescription('The discord channel to send the notifications to')
                    .setRequired(true)
            )
            .addRoleOption((option) =>
                option
                    .setName('ytping')
                    .setDescription('The role to ping when a new video is uploaded')
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove')
            .setDescription('Remove the youtube channel from the notification list.')
    );
