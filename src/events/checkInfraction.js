const config = require('~assets/json/_config/config.json');
const { setNewModLogMessage } = require('~utils/functions/modlog/modlog');
const { privateModResponse } = require('~utils/functions/privatResponses/privateModResponses');
const { giveAllRoles } = require('~utils/functions/roles/giveAllRoles');
const { removeMutedRole } = require('~utils/functions/roles/removeMutedRole');
const { saveAllRoles } = require('~utils/functions/roles/saveAllRoles');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const Infractions = require('~utils/classes/Infractions');

const interval = 1000 * 60; // 1 Minute

module.exports.checkInfractions = (bot) => {
    console.info('🔎📜 CheckInfraction handler started');
    setInterval(async () => {
        const results = await new Infractions().getAllOpen();

        let done = 0;
        let mutecount = 0;
        let bancount = 0;
        for (let i in results) {
            const till_dateDB = results[i].till_date;

            if (till_dateDB == null) continue;

            const currentdate = new Date().getTime();
            const till_date = till_dateDB.getTime();

            const currentYear = new Date().getFullYear();
            const infYear = results[i].till_date.getFullYear();
            if (currentdate - till_date >= 0 && currentYear <= infYear) {
                const guildId = results[i].guild_id;
                const guild = await bot.guilds.cache.get(guildId);
                const isMute = results[i].mute;

                if (isMute) {
                    const userId = results[i].user_id;
                    const user = await guild.members
                        .fetch(userId)
                        .then((members) => {
                            return members;
                        })
                        .catch(async () => {
                            return await bot.users.cache.get(userId);
                        });
                    try {
                        const userRoles = results[i].user_roles;
                        await removeMutedRole(user, guild);
                        if (user) {
                            await giveAllRoles(userId, guild, userRoles, bot);
                        }

                        await saveAllRoles(userRoles || null, user, guild);

                        await setNewModLogMessage(
                            bot,
                            config.defaultModTypes.unmute,
                            bot.user.id,
                            user ? user.id : userId,
                            'Auto',
                            null,
                            guildId
                        );

                        await privateModResponse({
                            member: user ? user.id : userId,
                            type: config.defaultModTypes.unmute,
                            reason: 'Auto',
                            bot,
                            guildname: guild.name,
                        });

                        const result = results[i];
                        await new Infractions().moveFromOpenToClosed(result);
                    } catch (err) {
                        errorhandler({ err });
                    }

                    done++;
                    mutecount++;
                    continue;
                } else {
                    const userId = results[i].user_id;
                    const guildId = results[i].guild_id;
                    //Member got banned
                    await new Infractions().moveFromOpenToClosed(results[i]);
                    await guild.members
                        .unban(`${userId}`, `Auto`)
                        .then(async () => {
                            await setNewModLogMessage(
                                bot,
                                config.defaultModTypes.unban,
                                bot.user.id,
                                userId,
                                'Auto',
                                null,
                                guildId
                            );

                            await privateModResponse(
                                bot.users.cache.get(userId),
                                config.defaultModTypes.unmute,
                                'Auto',
                                null,
                                bot,
                                guild.name
                            );
                        })
                        .catch(() => {});

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
    }, interval);
};
