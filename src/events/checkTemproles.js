const { database } = require("../db/db");
const config = require('../../config.json');
const { getCurrentDate } = require("../../utils/functions/getCurrentDate");

async function deleteEntries(infraction_id) {
    try {
        database.query('DELETE FROM temproles WHERE infraction_id = ?', [infraction_id], async (err) => { if(err) console.log(err) })
    }catch(err) {console.log(err)}
}

function checkTemproles(bot) {
    setInterval(() => {
        database.query('SELECT * FROM temproles', async (err, results) => {
            if(err) console.log(err)
            let done = 0;
            for (let i in results) {
                if(results[i].till_date == null) continue;

                let currentdate = getCurrentDate();
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                results[i].till_date = await results[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                if ((currentdate - results[i].till_date) > 0 && currentdate[8] + currentdate[9] >= results[i].till_date[7] + results[i].till_date[7]) {
                    try {
                        done++;
                        var guild = await bot.guilds.cache.get(config.DISCORD_GUILD_ID);
                        var user = await guild.members.fetch(results[i].user_id).then(members => members);
                        await user.roles.remove([bot.guilds.cache.get(config.DISCORD_GUILD_ID).roles.cache.find(r => r.id === results[i].role_id)])
                        deleteEntries(results[i].infraction_id);
                    }catch(err) {
                        done -= 1;
                        console.log(err)
                    }
                }
            }
            console.log(`Check Temproles finished. ${done} roles removed`)
        });
    }, config.defaultCheckTemprolesTimer);
}

module.exports = {checkTemproles}