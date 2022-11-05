const closedInfractions = require('../../../src/db/Models/tables/closedInfractions.model');
const openInfractions = require('../../../src/db/Models/tables/open_infractions.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const { getCurrentFullDate } = require('./dates');
const { Guilds } = require('./Guilds');

class Infractions {
    constructor() {}

    get({ inf_id, guild_id }) {
        return new Promise(async (resolve) => {
            const guild = await Guilds.get(guild_id);

            const open = await guild.getOpenInfractions({
                where: {
                    infraction_id: inf_id,
                },
            });

            const closed = await guild.getClosedInfractions({
                where: {
                    infraction_id: inf_id,
                },
            });

            return open.length > 0 ? resolve(open) : resolve(closed);
        });
    }

    getAllOpen() {
        return new Promise(async (resolve) => {
            openInfractions.findAll().then((results) => {
                return resolve(results);
            });
        });
    }

    getOpen({ user_id, guild_id }) {
        return new Promise(async (resolve) => {
            const guild = await Guilds.get(guild_id);
            return resolve(
                guild.getOpenInfractions({
                    where: {
                        user_id,
                    },
                })
            );
        });
    }

    insertOpen({
        uid,
        modid,
        mute = 0,
        ban = 0,
        till_date,
        reason,
        infraction_id,
        gid,
        roles = null,
    }) {
        const start_date = getCurrentFullDate();

        return new Promise(async (resolve) => {
            const guild = await Guilds.get(gid);
            guild.openInfractions.create({
                    uid,
                    modid,
                    mute,
                    ban,
                    till_date,
                    reason,
                    infraction_id,
                    start_date,
                    roles,
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err, fatal: true });
                    return resolve(false);
                });
        });
    }

    deleteOpen(inf_id) {
        return new Promise(async (resolve) => {
            openInfractions
                .destroy({
                    where: {
                        infraction_id: inf_id,
                    },
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err, fatal: true });
                    return resolve(false);
                });
        });
    }

    deleteClosed(inf_id) {
        return new Promise(async (resolve) => {
            closedInfractions
                .destroy({
                    where: {
                        infraction_id: inf_id,
                    },
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err, fatal: true });
                    return resolve(false);
                });
        });
    }

    getAllClosed() {
        return new Promise(async (resolve) => {
            closedInfractions.findAll().then((results) => {
                return resolve(results);
            });
        });
    }

    insertClosed({
        uid,
        mod_id,
        mute = 0,
        ban = 0,
        warn = 0,
        kick = 0,
        till_date,
        reason,
        infraction_id,
        start_date = getCurrentFullDate(),
        guild_id,
    }) {
        return new Promise(async (resolve) => {
            closedInfractions.create({
                    user_id: uid,
                    mod_id,
                    mute,
                    ban,
                    warn,
                    kick,
                    till_date,
                    reason,
                    infraction_id,
                    start_date,
                    guild_id
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err, fatal: true });
                    return resolve(false);
                });
        });
    }

    getClosed({ user_id, guild_id }) {
        return new Promise(async (resolve) => {
            const guild = await Guilds.get(guild_id);
            return guild.getClosedInfractions({
                where: {
                    user_id,
                },
            });
        });
    }
}

module.exports.Infractions = new Infractions();
