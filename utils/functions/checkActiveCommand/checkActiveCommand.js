<<<<<<< HEAD
const { GuildConfig } = require('../data/Config');
const { GlobalConfig } = require('../data/GlobalConfig');

module.exports.checkActiveCommand = async (command_name, guild_id) => {
    const global_config = await GlobalConfig.get();

    const global_disabled =
        global_config.disabled_commands || global_config.disabled_commands || [];
=======
const {
    getGuildConfig
} = require('../data/getConfig');
const {
    getGlobalConfig
} = require("../data/ignoreMode");

module.exports.checkActiveCommand = async (command_name, guild_id) => {

    const global_config = await getGlobalConfig();

    let global_disabled = JSON.parse(global_config.disabled_commands) || global_config.disabled_commands || [];
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    if (global_disabled.includes(command_name)) {
        return {
            enabled: false,
            global_disabled: true
        };
    }

<<<<<<< HEAD
    const guildConfig = await GuildConfig.get(guild_id);

    const guild_disabled = guildConfig.disabled_commands;
=======
    const {settings} = await getGuildConfig({
        guild_id
    });

    const guild_disabled = JSON.parse(settings.disabled_commands) || settings.disabled_commands || [];
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    if (guild_disabled.includes(command_name)) {
        return {
            enabled: false,
            global_disabled: false
        };
    }else {
        return {
            enabled: true,
            global_disabled: false
        };
    }
}