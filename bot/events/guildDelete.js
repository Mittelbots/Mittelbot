const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');

module.exports.guildDelete = async (guild) => {
    errorhandler({
        fatal: false,
        message: ` I left a Guild: ${guild.name} (${guild.id})`,
        id: 1694432472,
    });
};
