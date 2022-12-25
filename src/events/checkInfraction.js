const config = require('../../src/assets/json/_config/config.json');
const { setNewModLogMessage } = require('../../utils/modlog/modlog');
const { privateModResponse } = require('../../utils/privatResponses/privateModResponses');
const { giveAllRoles } = require('../../utils/functions/roles/giveAllRoles');
const { removeMutedRole } = require('../../utils/functions/roles/removeMutedRole');
const { saveAllRoles } = require('../../utils/functions/roles/saveAllRoles');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');
const { Infractions } = require('../../utils/functions/data/Infractions');

module.exports.checkInfractions = (bot) => {
    console.info('🔎📜 CheckInfraction handler started');
    setInterval(async () => {
        const results = await Infractions.getAllOpen();

        let done = 0;
        let mutecount = 0;
        let bancount = 0;
        for (let i in results) {
            if (results[i].till_date == null) continue;

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
                            results[i].user_roles,
                            bot
                        );

                        await saveAllRoles(
                            results[i].user_roles || null,
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

                        await Infractions.moveFromOpenToClosed(results[i]);
                    } catch (err) {
                        errorhandler({
                            err,
                            fatal: true,
                        });
                    }

                    done++;
                    mutecount++;
                    continue;
                } else {
                    //Member got banned
                    await Infractions.moveFromOpenToClosed(results[i]);
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

                    done++;
                    bancount++;
                }
            }
        }
        console.info(
            `Check Infraction done. ${done} infractions removed! (${mutecount} Mutes & ${bancount} Bans)`,
            new Date().toLocaleString('de-DE', {
                timeZone: 'Europe/Berlin',
            })
        );
    }, config.defaultCheckInfractionTimer);
};
