const config = require('../../src/assets/json/_config/config.json');
const { insertDataToClosedInfraction } = require('../../utils/functions/insertDataToDatabase');
const { setNewModLogMessage } = require('../../utils/modlog/modlog');
const { privateModResponse } = require('../../utils/privatResponses/privateModResponses');
const { log } = require('../../logs');
const { giveAllRoles } = require('../../utils/functions/roles/giveAllRoles');
const { removeMutedRole } = require('../../utils/functions/roles/removeMutedRole');
const database = require('../db/db');
const { saveAllRoles } = require('../../utils/functions/roles/saveAllRoles');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');


async function deleteEntries(infraction) {
    try {
        insertDataToClosedInfraction(infraction.user_id, infraction.mod_id, infraction.mute, infraction.ban, 0, 0, infraction.till_date, infraction.reason, infraction.infraction_id);

        database.query('DELETE FROM open_infractions WHERE infraction_id = ?', [infraction.infraction_id]).catch(err => console.log(err));

    }catch(err) {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
    }
}

function checkInfractions(bot) {
    console.log("🔎 CheckInfraction handler started");
    setInterval(async () => {
        await database.query(`SELECT * FROM open_infractions`).then(async results => {
            let done = 0;
            let mutecount = 0;
            let bancount = 0;
            for(let i in await results) {
                if(results[i].till_date == null) continue;

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
                    if(results[i].mute) {
                        try {
                            var guild = await bot.guilds.cache.get(results[i].guild_id);
                            var user = await guild.members.fetch(results[i].user_id).then(members => members);
                        }catch(err) {
                            //Member left or got kicked
                            deleteEntries(results[i]);
                            continue;
                        }
                        try {
                            await removeMutedRole(user, bot.guilds.cache.get(results[i].guild_id));

                            await giveAllRoles(results[i].user_id, bot.guilds.cache.get(results[i].guild_id), JSON.parse(results[i].user_roles), bot);

                            await saveAllRoles(JSON.parse(results[i].user_roles), bot.users.cache.get(results[i].user_id), log, bot.guilds.cache.get(results[i].guild_id));

                            await setNewModLogMessage(bot, config.defaultModTypes.unmute, bot.user.id, user, 'Auto', null, results[i].guild_id);

                            await privateModResponse(user, config.defaultModTypes.unmute, 'Auto', null, bot, guild.name);
                            
                            await deleteEntries(results[i]);

                            done++;
                            mutecount++;
                            continue;
                        }catch(err) {
                            return errorhandler({err, fatal: true});
                        }
                    }else { //Member got banned
                        done++;
                        bancount++;
                        try {
                            await bot.guilds.cache.get(results[i].guild_id).members.unban(`${results[i].user_id}`, `Auto`)
                            setNewModLogMessage(bot, config.defaultModTypes.unban, bot.user.id, results[i].user_id, 'Auto', null, results[i].guild_id);
                            deleteEntries(results[i]);
                        }catch(err) {
                            //Unknown ban
                            deleteEntries(results[i]);
                        }
                    }
                }
            }
            console.log(`Check Infraction done. ${done} infractions removed! (${mutecount} Mutes & ${bancount} Bans)`, new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'}))
        }).catch(err => {
            if(config.debug == 'true') console.log(err);
            return log.fatal(err);
        });
    }, config.defaultCheckInfractionTimer);
}

module.exports = {checkInfractions}