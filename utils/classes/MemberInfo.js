const memberInfo = require('~src/db/Models/memberInfo.model');
const Guilds = require('./Guilds');

class MemberInfo {
    constructor() {}

    add({ guild_id, user_id, member_roles, user_joined = new Date(), afk = null }) {
        return new Promise(async (resolve, reject) => {
            memberInfo
                .create({
                    guild_id,
                    user_id,
                    member_roles,
                    user_joined,
                    afk,
                })
                .then((data) => {
                    resolve(data);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    get({ guild_id, user_id }) {
        return new Promise(async (resolve) => {
            const guild = await new Guilds().get(guild_id);
            const memberInfo = await guild.getMemberInfo({
                where: {
                    user_id,
                },
            });

            if (memberInfo.length === 0) {
                return resolve(
                    await this.add({ guild_id, user_id, member_roles: [], user_joined: null })
                );
            }
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
                    return reject(false);
                });
        });
    }

    updateAfk({ guild_id, user_id, afk }) {
        return new Promise(async (resolve, reject) => {
            memberInfo
                .update(
                    {
                        afk,
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
                    return reject(false);
                });
        });
    }
}

module.exports = MemberInfo;
