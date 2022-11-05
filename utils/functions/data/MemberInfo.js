const memberInfo = require('../../../src/db/Models/tables/memberInfo.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const { Guilds } = require('./Guilds');

class MemberInfo {
    constructor() {}

    add({ guild_id, user_id, member_roles, user_joined = 'null' }) {
        return new Promise(async (resolve, reject) => {
            memberInfo
                .create({
                    guild_id,
                    user_id,
                    member_roles,
                    user_joined,
                })
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(false);
                });
        });
    }

    get({ guild_id, user_id }) {
        return new Promise(async (resolve, reject) => {
            const guild = await Guilds.get(guild_id);
            return resolve(
                guild.getMemberInfo({
                    where: {
                        user_id,
                    },
                })
            );
        });
    }

    update({ guild_id, user_id, member_roles, user_joined }) {
        return new Promise(async (resolve, reject) => {
            memberInfo
                .update(
                    {
                        member_roles: member_roles ? member_roles : null,
                        user_joined: user_joined ? user_joined : null,
                    },
                    {
                        where: {
                            user_id,
                            guild_id,
                        },
                    }
                )
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(false);
                });
        });
    }
}

module.exports.MemberInfo = new MemberInfo();
