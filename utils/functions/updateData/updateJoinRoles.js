const database = require('../../../src/db/db');
const { getFromCache, updateCache } = require('../cache/cache');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.updateJoinRoles = async ({guild_id, joinrole_id, message}) => {
    if (!joinrole_id) {

        await updateCache({
            cacheName: 'joinroles',
            param_id: guild_id,
            updateVal: '[]',
            updateValName: 'role_id',
        })

        return await database.query(`DELETE FROM ${guild_id}_guild_joinroles`)
            .then(() => {
                message.reply(`Joinroles successfully cleared.`).catch(err => {});
            })
            .catch(err => {
                return errorhandler({
                    err,
                    fatal: true
                });
            });
    } else {

        const cache = await getFromCache({
            cacheName: 'joinroles',
            param_id: guild_id,
        });

        let roles;
        if(cache[0].role_id == '' || cache[0].role_id == '[]') {
            roles = [];
        }else {
            roles = JSON.parse(cache[0].role_id);
        }
        
        roles.push(joinrole_id);

        await updateCache({
            cacheName: 'joinroles',
            param_id: guild_id,
            updateVal: JSON.stringify(roles),
            updateValName: 'role_id',
        });

        return await database.query(`INSERT INTO ${guild_id}_guild_joinroles (role_id) VALUES (?)`, [joinrole_id]).catch(err => {
            return errorhandler({
                err,
                fatal: true
            });
        })
    }
}