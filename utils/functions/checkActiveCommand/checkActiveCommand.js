const { getGuildConfig } = require('../data/getConfig');
const { getGlobalConfig } = require('../data/ignoreMode');

module.exports.checkActiveCommand = async (command_name, guild_id) => {
    const global_config = await getGlobalConfig();

    let global_disabled =
        JSON.parse(global_config.disabled_commands) || global_config.disabled_commands || [];

    if (global_disabled.includes(command_name)) {
        return {
            enabled: false,
            global_disabled: true,
        };
    }

    const { settings } = await getGuildConfig({
        guild_id,
    });

    const guild_disabled =
        JSON.parse(settings.disabled_commands) || settings.disabled_commands || [];

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
