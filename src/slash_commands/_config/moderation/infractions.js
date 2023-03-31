const { SlashCommandBuilder } = require('discord.js');

module.exports.infractionsConfig = new SlashCommandBuilder()
    .setName('infractions')
    .setDescription('See infractions of a user')
    .addSubcommand((command) =>
        command
            .setName('all')
            .setDescription('See all infractions of a user')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setRequired(true)
                    .setDescription('The user to see infractions of')
            )
    )
    .addSubcommand((command) =>
        command
            .setName('view')
            .setDescription('View an specific infraction')
            .addStringOption((option) =>
                option
                    .setName('infractionid')
                    .setRequired(true)
                    .setDescription('The id of the infraction to view')
            )
    )
    .addSubcommand((command) =>
        command
            .setName('remove')
            .setDescription('Remove an specific infraction')
            .addStringOption((option) =>
                option
                    .setName('infractionid')
                    .setRequired(true)
                    .setDescription('The id of the infraction to remove')
            )
    );
