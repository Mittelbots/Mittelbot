const GuildConfig = require('~utils/classes/Config');
const GlobalConfig = require('~utils/classes/GlobalConfig');

module.exports.checkActiveCommand = async (command_name, guild_id) => {
    const global_config = await new GlobalConfig().get();
    const global_disabled = global_config.disabled_commands;
    if (global_disabled.includes(command_name)) {
        return {
            enabled: false,
            global_disabled: true,
        };
    }

    const guildConfig = await new GuildConfig().get(guild_id);

    const guild_disabled = guildConfig.disabled_commands;

    if (guild_disabled.includes(command_name)) {
        return {
            enabled: false,
            global_disabled: false,
        };
    } else {
        return {
            enabled: true,
            global_disabled: false,
        };
    }
};
