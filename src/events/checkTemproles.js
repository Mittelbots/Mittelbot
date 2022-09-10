const config = require('../../src/assets/json/_config/config.json');
const {
    getCurrentDate
} = require("../../utils/functions/getCurrentDate");
const database = require('../db/db');
const {
    temproles
} = require('../../utils/functions/cache/cache');
const {
    errorhandler
} = require('../../utils/functions/errorhandler/errorhandler');
const { getAllTemproles } = require('../../utils/functions/data/temproles');


async function deleteEntries(infraction_id, ) {
    database.query('DELETE FROM temproles WHERE infraction_id = ?', [infraction_id])
        .then(() => {
            for (let i in temproles[0].list) {
                if (temproles[0].list[i].infraction_id == infraction_id) {
                    delete temproles[0].list[i];
                }
            }
            temproles[0].list = temproles[0].list.filter(Boolean);
        })
        .catch(err => {
            errorhandler({
                err,
                fatal: true
            })
        });
}

module.exports.checkTemproles = async (bot) => {
    console.info("🔎📜 CheckTemproles handler started");
    setInterval(async () => {

        var results = await getAllTemproles();

        let done = 0;
        for (let i in results) {
            if (results[i].till_date == null) continue;

            let currentdate = getCurrentDate({timestamp: null});
            currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
            results[i].till_date = await results[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
            if ((currentdate - results[i].till_date) > 0 && currentdate[8] + currentdate[9] >= results[i].till_date[7] + results[i].till_date[7]) {
                try {
                    done++;
                    var guild = await bot.guilds.cache.get(results[i].guild_id);
                    var user = await guild.members.fetch(results[i].user_id).then(members => members);
                    await user.roles.remove([bot.guilds.cache.get(results[i].guild_id).roles.cache.find(r => r.id === results[i].role_id)])
                    deleteEntries(results[i].infraction_id);
                } catch (err) {
                    // CAN'T FIND USER OR USER LEFT THE SERVER
                    done -= 1;
                    if (config.debug) console.log(err);
                }
            }
        }
        console.info(`Check Temproles finished. ${done} roles removed`)
    }, config.defaultCheckTemprolesTimer);
}