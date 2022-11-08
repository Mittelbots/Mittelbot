const config = require('../../src/assets/json/_config/config.json');
<<<<<<< HEAD
const { setNewModLogMessage } = require('../../utils/modlog/modlog');
const { privateModResponse } = require('../../utils/privatResponses/privateModResponses');
const { giveAllRoles } = require('../../utils/functions/roles/giveAllRoles');
const { removeMutedRole } = require('../../utils/functions/roles/removeMutedRole');
const { saveAllRoles } = require('../../utils/functions/roles/saveAllRoles');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');
const { Infractions } = require('../../utils/functions/data/Infractions');

async function deleteEntries(infraction) {
    Infractions.deleteOpen(infraction.infraction_id);
=======
const {
    setNewModLogMessage
} = require('../../utils/modlog/modlog');
const {
    privateModResponse
} = require('../../utils/privatResponses/privateModResponses');
const {
    giveAllRoles
} = require('../../utils/functions/roles/giveAllRoles');
const {
    removeMutedRole
} = require('../../utils/functions/roles/removeMutedRole');
const {
    saveAllRoles
} = require('../../utils/functions/roles/saveAllRoles');
const {
    errorhandler
} = require('../../utils/functions/errorhandler/errorhandler');
const {
    insertIntoClosedList, getAllOpenInfractions, removeInfractionById
} = require('../../utils/functions/data/infractions');
const {
    openInfractions
} = require('../../utils/functions/cache/cache');


async function deleteEntries(infraction) {
    removeInfractionById({inf_id: infraction.infraction_id, type: 'open'});
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    Infractions.insertClosed({
        uid: infraction.user_id,
        mod_id: infraction.mod_id,
        mute: infraction.mute,
        ban: infraction.ban,
        till_date: infraction.till_date,
        reason: infraction.reason,
        infraction_id: infraction.infraction_id,
        start_date: infraction.start_date,
        guild_id: infraction.guild_id
    });
}

module.exports.checkInfractions = (bot) => {
    console.info("🔎📜 CheckInfraction handler started");
    setInterval(async () => {
<<<<<<< HEAD
        const results = await Infractions.getAllOpen();

=======

        var results;
        if (openInfractions) {
            results = openInfractions[0].list;
        }else {
            results = await getAllOpenInfractions();
        }
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
        let done = 0;
        let mutecount = 0;
        let bancount = 0;
        for (let i in results) {
            if (results[i].till_date == null) continue;

<<<<<<< HEAD
            const currentdate = new Date().getTime();
            const till_date = results[i].till_date.getTime();

            const currentYear = new Date().getFullYear();
            const infYear = results[i].till_date.getFullYear();
            if (currentdate - till_date >= 0 && currentYear <= infYear) {
                if (results[i].mute) {
                    const guild = await bot.guilds.cache.get(results[i].guild_id);
                    const user = await guild.members
                        .fetch(results[i].user_id)
                        .then((members) => {
                            return members;
                        })
                        .catch((err) => {});
                    try {
                        await removeMutedRole(user, bot.guilds.cache.get(results[i].guild_id));

                        await giveAllRoles(
                            results[i].user_id,
                            bot.guilds.cache.get(results[i].guild_id),
                            JSON.parse(results[i].user_roles),
                            bot
                        );

                        await saveAllRoles(
                            JSON.parse(results[i].user_roles) || null,
                            bot.users.cache.get(results[i].user_id),
                            bot.guilds.cache.get(results[i].guild_id)
                        );

                        await setNewModLogMessage(
                            bot,
                            config.defaultModTypes.unmute,
                            bot.user.id,
                            user || results[i].user_id,
                            'Auto',
                            null,
                            results[i].guild_id
                        );

                        await privateModResponse(
                            user || bot.users.cache.get(results[i].user_id),
                            config.defaultModTypes.unmute,
                            'Auto',
                            null,
                            bot,
                            guild.name
                        );
=======
            //Member can be unmuted
            let currentdate = new Date()

            var inf_date = results[i].till_date.split('.');

            const year = inf_date[2].split(',')[0];
            const month = (inf_date[1] < 10) ? inf_date[1].replace('0', '') : inf_date[1];
            const day = (inf_date[0] < 10) ? inf_date[0].replace('0', '') : inf_date[0];
            const time = inf_date[2].split(':');
            const hr = time[0].split(',')[1].replace(' ', '');
            const min = time[1];
            const sec = time[2];

            inf_date = new Date(year, month - 1, day, hr, min, sec);

            if (currentdate.getTime() >= inf_date.getTime()) { //&& currentdate.getFullYear() <= inf_date.getFullYear()
                if (results[i].mute) {
                    try {
                        var guild = await bot.guilds.cache.get(results[i].guild_id);
                        var user = await guild.members.fetch(results[i].user_id).then(members => members);
                    } catch (err) {
                        //Member left or got kicked
                        deleteEntries(results[i]);
                        continue;
                    }
                    try {
                        await removeMutedRole(user, bot.guilds.cache.get(results[i].guild_id));

                        await giveAllRoles(results[i].user_id, bot.guilds.cache.get(results[i].guild_id), JSON.parse(results[i].user_roles), bot);

                        await saveAllRoles(JSON.parse(results[i].user_roles) || null, bot.users.cache.get(results[i].user_id), bot.guilds.cache.get(results[i].guild_id));

                        await setNewModLogMessage(bot, config.defaultModTypes.unmute, bot.user.id, user, 'Auto', null, results[i].guild_id);

                        await privateModResponse(user, config.defaultModTypes.unmute, 'Auto', null, bot, guild.name);
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

                        await deleteEntries(results[i]);
                    } catch (err) {
                        errorhandler({
                            err,
                            fatal: true
                        });
                    }

                    done++;
                    mutecount++;
                    continue;
                } else { //Member got banned
                    done++;
                    bancount++;
<<<<<<< HEAD
                    await deleteEntries(results[i]);
                    await bot.guilds.cache
                        .get(results[i].guild_id)
                        .members.unban(`${results[i].user_id}`, `Auto`)
                        .then(async () => {
                            await setNewModLogMessage(
                                bot,
                                config.defaultModTypes.unban,
                                bot.user.id,
                                results[i].user_id,
                                'Auto',
                                null,
                                results[i].guild_id
                            );

                            await privateModResponse(
                                bot.users.cache.get(results[i].user_id),
                                config.defaultModTypes.unmute,
                                'Auto',
                                null,
                                bot,
                                guild.name
                            );
                        })
                        .catch((err) => {});
=======
                    try {
                        await bot.guilds.cache.get(results[i].guild_id).members.unban(`${results[i].user_id}`, `Auto`)
                        setNewModLogMessage(bot, config.defaultModTypes.unban, bot.user.id, results[i].user_id, 'Auto', null, results[i].guild_id);
                        deleteEntries(results[i]);
                    } catch (err) {
                        //Unknown ban
                        deleteEntries(results[i]);
                    }
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
                }
            }
        }
        console.info(`Check Infraction done. ${done} infractions removed! (${mutecount} Mutes & ${bancount} Bans)`, new Date().toLocaleString('de-DE', {
            timeZone: 'Europe/Berlin'
        }))
    }, config.defaultCheckInfractionTimer);
}