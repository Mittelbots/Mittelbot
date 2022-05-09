const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');
const config = require('../../../src/assets/json/_config/config.json');
const token = require('../../../_secret/token.json');
const fs = require('node:fs');

module.exports.createSlashCommands = async () => {

    const commands = [];
    const modules = fs.readdirSync('./src/slash_commands').filter(file => file !== 'index.js');

    // Place your client and guild ids here
    const clientId = config.DISCORD_APPLICATION_ID;
    const guildId = config.DEVELOPER_DISCORD_GUILD_ID;

    for (const cmd_folder of modules) {
        const files = fs.readdirSync(`./src/slash_commands/${cmd_folder}/`);
        for (const command_file of files) {
            console.log(`${command_file} Command has been loaded!`);
            const command = require(`../../../src/slash_commands/${cmd_folder}/${command_file}`);
            commands.push(command.data.toJSON());
        }

    }

    const rest = new REST({
        version: '9'
    }).setToken(token.BOT_TOKEN);

    (async () => {
        try {
            console.log('🕐 Started refreshing application (/) commands.');

            if (config.debug == 'true') {
                console.log('🕐 Started refreshing in Development.');
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId), {
                        body: commands
                    },
                );
            } else {
                console.log('🕐 Started refreshing in Production.');
                await rest.put(
                    Routes.applicationCommands(clientId), {
                        body: commands
                    },
                );
            }


            console.log('✅ Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
}