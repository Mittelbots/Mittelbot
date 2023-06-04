const closedInfractions = require('~src/db/Models/closedInfractions.model');
const openInfractions = require('~src/db/Models/open_infractions.model');
const Guilds = require('./Guilds');

class Infractions {
    constructor() {}

    get({ inf_id, guild_id }) {
        return new Promise(async (resolve) => {
            const guild = await new Guilds().get(guild_id);

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
            const guild = await new Guilds().get(guild_id);
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
        roles = [],
    }) {
        return new Promise(async (resolve) => {
            openInfractions
                .create({
                    user_id: uid,
                    mod_id: modid,
                    mute,
                    ban,
                    till_date,
                    reason,
                    infraction_id,
                    start_date: new Date(),
                    user_roles: roles,
                    guild_id: gid,
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
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
        start_date = new Date(),
        guild_id,
    }) {
        return new Promise(async (resolve) => {
            closedInfractions
                .create({
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
                    guild_id,
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    return resolve(false);
                });
        });
    }

    getClosed({ user_id, guild_id }) {
        return new Promise(async (resolve) => {
            const guild = await new Guilds().get(guild_id);
            return resolve(
                guild.getClosedInfractions({
                    where: {
                        user_id,
                    },
                })
            );
        });
    }

    moveFromOpenToClosed(infraction) {
        return new Promise(async (resolve) => {
            this.deleteOpen(infraction.infraction_id);

            this.insertClosed({
                uid: infraction.user_id,
                mod_id: infraction.mod_id,
                mute: infraction.mute,
                ban: infraction.ban,
                till_date: infraction.till_date,
                reason: infraction.reason,
                infraction_id: infraction.infraction_id,
                start_date: infraction.start_date,
                guild_id: infraction.guild_id,
            });

            return resolve(true);
        });
    }
}

module.exports = Infractions;
