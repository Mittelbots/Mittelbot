const { errorhandler } = require('../errorhandler/errorhandler');
const Infractions = require('~utils/classes/Infractions');

async function isMuted({ user, guild }) {
    return new Promise(async (resolve, reject) => {
        let open_infractions = await new Infractions().getOpen({
            user_id: user.id,
            guild_id: guild.id,
        });
        open_infractions = open_infractions.filter((inf) => inf.mute);
        const member = guild.members.cache.get(user.id);

        if (!member) return reject('No member found!');
        if (open_infractions.length > 0) {
            open_infractions.forEach((inf) => {
                const currentdate = new Date().getTime();
                const till_date = inf.till_date.getTime();
                if (currentdate - till_date >= 0) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        } else {
            return resolve(false);
        }
    });
}

async function isOnBanList({ user, guild }) {
    let fetchedLogs;
    try {
        fetchedLogs = await guild.fetchAuditLogs({
            type: 22,
        });
    } catch (err) {
        errorhandler({
            fatal: false,
            message: `Error while fetching the ban list ${err.message}`,
            id: 1694433543,
        });
        return [false]; // NO PERMISSIONS
    }
    let banLog = await fetchedLogs.entries.filter((entry) => entry.target.id === user.id);

    let executor;
    let reason;
    if (banLog) {
        banLog = banLog.first();
        if (!banLog) return [false];
        executor = banLog.executor;
        reason = banLog.reason;
    }

    return await guild.bans
        .fetch()
        .then(async (bans) => {
            let list = bans.filter((ban) => ban.user.id === user.id);

            if (list.size < 0) return [false];
            else return [true, reason, executor];
        })
        .catch((err) => {
            errorhandler({
                fatal: false,
                message: `Error while fetching the ban list ${err.message}`,
                id: 1694433571,
            });
            return [false];
        });
}

function isBanned(member, guild) {
    return new Promise(async (resolve) => {
        let banList = await guild.bans.fetch();

        const open_infractions = await new Infractions().getOpen({
            user_id: member.id || member,
            guild_id: guild.id,
        });

        const banned = open_infractions.filter((inf) => inf.ban);

        if (banned.length > 0) {
            const isUserOnBanList = banList.get(member.id || member);
            banned.forEach(async (inf) => {
                const currentdate = new Date().getTime();
                const till_date = inf.till_date.getTime();
                if (currentdate - till_date <= 0 && isUserOnBanList !== undefined) {
                    return resolve(true);
                } else {
                    if (currentdate - till_date >= 0 || isUserOnBanList === undefined) {
                        await new Infractions().deleteOpen(inf.infraction_id);
                        await new Infractions().insertClosed({
                            uid: inf.user_id,
                            mod_id: inf.mod_id,
                            mute: inf.mute,
                            ban: inf.ban,
                            till_date: inf.till_date,
                            reason: inf.reason,
                            infraction_id: inf.infraction_id,
                            start_date: inf.start_date,
                            guild_id: inf.guild_id,
                        });
                    }
                    return resolve(false);
                }
            });
        } else {
            return resolve(false);
        }
    });
}

module.exports = {
    isMuted,
    isBanned,
    isOnBanList,
};
