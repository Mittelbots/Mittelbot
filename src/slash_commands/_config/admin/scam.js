const { SlashCommandBuilder } = require('discord.js');

module.exports.scamConfig = new SlashCommandBuilder()
    .setName('scam')
    .setDescription('Add or remove scam website to the scam community list')
    .addSubcommand((command) =>
        command
            .setName('add')
            .setDescription('Add a scam website to the scam community list')
            .addStringOption((option) =>
                option
                    .setName('link')
                    .setDescription('The Link of the scam website you want to add.')
                    .setRequired(true)
            )
    )

    .addSubcommand((command) =>
        command
            .setName('remove')
            .setDescription('Add a scam website to the scam community list')
            .addStringOption((option) =>
                option
                    .setName('link')
                    .setDescription('The Link of the scam website you want to add.')
                    .setRequired(true)
            )
    )

    .addSubcommand((command) =>
        command
            .setName('view')
            .setDescription('Add a scam website to the scam community list')
            .addStringOption((option) =>
                option
                    .setName('link')
                    .setDescription('The Link of the scam website you want to add.')
                    .setRequired(false)
            )
    );
