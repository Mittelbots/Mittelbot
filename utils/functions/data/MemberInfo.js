const memberInfo = require('../../../src/db/Models/tables/memberInfo.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const { Guilds } = require('./Guilds');

class MemberInfo {
    constructor() {}

    add({ guild_id, user_id, member_roles, user_joined = new Date() }) {
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
        return new Promise(async (resolve) => {
            const guild = await Guilds.get(guild_id);
            const memberInfo = await guild.getMemberInfo({
                where: {
                    user_id,
                },
            });
            return resolve(memberInfo[0]);
        });
    }

    update({ guild_id, user_id, member_roles, user_joined }) {
        return new Promise(async (resolve, reject) => {
            let updateQuery = {};

            switch (true) {
                case member_roles !== undefined:
                    updateQuery.member_roles = member_roles;
                    break;
                case user_joined !== undefined:
                    updateQuery.user_joined = user_joined;
                    break;
                default:
                    return reject(false);
            }

            memberInfo
                .update(updateQuery, {
                    where: {
                        user_id,
                        guild_id,
                    },
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
}

module.exports.MemberInfo = new MemberInfo();
