const database = require("../../../src/db/db");
const { log } = require('../../../logs');

module.exports.checkActiveCommand = async (command_name, guild_id) => {

    return await database.query('SELECT active_commands, disabled_commands, global_disabled FROM active_commands WHERE guild_id = ?', [guild_id]).then(async res => {
        res = await res;

        if(res.length == 0) {
            log.warn('Missing guild_id in active_commands table!' + guild_id);
            return {enabled: false, global_disabled: false};
        }

        let disabled_commands = JSON.parse(res[0].disabled_commands);
        let global_disabled = JSON.parse(res[0].global_disabled);

        if(global_disabled.includes(command_name)) {
            return {enabled: false, global_disabled: true};
        }


        if(disabled_commands.includes(command_name) ) {    
            return {enabled: false, global_disabled: false};
        }else {
            return {enabled: true, global_disabled: false};
        }
    })
    .catch(err => {
        log.fatal(err);
        return {enabled: false, global_disabled: false};
    })
}