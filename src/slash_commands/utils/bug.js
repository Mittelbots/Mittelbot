const { EmbedBuilder } = require('discord.js');
const { bugConfig } = require('../_config/utils/bug');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');

module.exports.run = async ({ main_interaction, bot }) => {
    const bugDescription = main_interaction.options.getString('bug');
    const reproduce = main_interaction.options.getString('reproduce');
    const expected = main_interaction.options.getString('expected');

    const object = [
        {
            name: 'Description',
            value: bugDescription,
        },
        {
            name: 'How to reproduce',
            value: reproduce,
        },
        {
            name: 'Expected result',
            value: expected,
        },
        {
            name: 'Reported by',
            value: main_interaction.user.username,
            inline: true,
        },
        {
            name: 'User ID',
            value: main_interaction.user.id,
            inline: true,
        },
        {
            name: 'Guild',
            value: `${main_interaction.guild.name} (${main_interaction.guild.id})`,
            inline: true,
        },
    ];

    const embedToDevs = new EmbedBuilder()
        .setTitle('New bug report')
        .setFields(object)
        .setColor(global.t.trans(['general.colors.error']))
        .setTimestamp();

    const embedToUser = new EmbedBuilder()
        .setDescription(global.t.trans(['success.utils.bug.sent'], main_interaction.guild.id))
        .addFields(object.splice(0, 3))
        .setColor(global.t.trans(['general.colors.success']))
        .setTimestamp();

    bot.channels.cache
        .get(process.env.DC_BUGREPORTS)
        .send({ embeds: [embedToDevs] })
        .then(() => {
            main_interaction.reply({ embeds: [embedToUser] }).catch(() => {});
        })
        .catch((err) => {
            errorhandler({ err });
        });

    return;
};

module.exports.data = bugConfig;
