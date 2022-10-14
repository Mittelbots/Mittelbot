const database = require('../../../src/db/db');
const { getAllGuildIds } = require('./getAllGuildIds');
const { getFromCache, memberInfo } = require('../cache/cache');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.getAllMemberInfo = async () => {
    const all_guild_id = await getAllGuildIds();

    if (all_guild_id) {
        let response = [];
        for (let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                member_info: await this.getMemberInfo({
                    guild_id: all_guild_id[i].guild_id,
                }),
            };
            response.push(obj);
        }
        return response;
    } else {
        return false;
    }
};

/** cache */
module.exports.getMemberInfo = async () => {
    return await database
        .query(`SELECT * FROM member_info`)
        .then((res) => {
            if (res.length > 0) {
                return res;
            } else {
                return false;
            }
        })
        .catch((err) => {
            errorhandler({
                err: err,
                fatal: true,
            });
            return {
                error: true,
            };
        });
};

module.exports.getMemberInfoById = async ({ guild_id, user_id }) => {
    const cache = await getFromCache({
        cacheName: 'memberInfo',
        param_id: guild_id,
    });

    if (cache) {
        var userInfo = cache[0].memberInfo.find(
            (x) => x.user_id === user_id && x.guild_id === guild_id
        );
        return userInfo || false;
    }
    return await database
        .query(`SELECT * FROM member_info WHERE user_id = ? AND guild_id = ?`, [user_id, guild_id])
        .then((res) => {
            if (res.length > 0) {
                return res[0];
            } else {
                return false;
            }
        })
        .catch((err) => {
            errorhandler({
                err: err,
                fatal: true,
            });
            return {
                error: true,
            };
        });
};

module.exports.updateMemberInfoById = async ({ guild_id, user_id, member_roles, user_joined }) => {
    let args = [];
    if (member_roles) {
        args.push(JSON.stringify(member_roles));
    }
    if (user_joined) {
        args.push(user_joined);
    }
    args.push(user_id);
    args.push(guild_id);

    return await database
        .query(
            `UPDATE member_info SET ${member_roles ? 'member_roles = ?' : ''} ${
                member_roles && user_joined ? ', ' : ''
            } ${user_joined ? 'user_joined = ?' : ''} WHERE user_id = ? AND guild_id = ?`,
            [...args]
        )
        .then((res) => {
            for (let i in memberInfo) {
                if (memberInfo[i].user_id === user_id && memberInfo[i].guild_id === guild_id) {
                    member_roles ? (memberInfo[i].member_roles = member_roles) : '';
                    user_joined ? (memberInfo[i].user_joined = user_joined) : '';
                }
            }
            return true;
        })
        .catch((err) => {
            errorhandler({
                err,
            });
            return false;
        });
};

module.exports.insertMemberInfo = async ({
    guild_id,
    user_id,
    member_roles = '[]',
    user_joined = 'null',
}) => {
    return await database
        .query(
            `INSERT INTO member_info (user_id, guild_id, member_roles, user_joined) VALUES (?, ?, ?, ?)`,
            [user_id, guild_id, member_roles, user_joined]
        )
        .then((res) => {
            const obj = {
                user_id: user_id,
                guild_id: guild_id,
                member_roles: member_roles,
                user_joined: user_joined,
            };

            for (let i in memberInfo) {
                if (memberInfo[i].id === guild_id) {
                    memberInfo[i].memberInfo.push(obj);
                }
            }
            return true;
        })
        .catch((err) => {
            errorhandler({
                err,
            });
            return false;
        });
};
