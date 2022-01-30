const config = require('../../src/assets/json/_config/config.json');
const { getCurrentDate } = require("../../utils/functions/getCurrentDate");
const { log } = require('../../logs');

const {Database} = require('../db/db')

async function deleteEntries(infraction_id) {
    try {
        const database = new Database();
        database.query('DELETE FROM temproles WHERE infraction_id = ?', [infraction_id]).catch(err => console.log(err))
        database.close();
    }catch(err) {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
    }
}

function checkTemproles(bot) {
    setInterval(() => {
        const database = new Database();
        database.query('SELECT * FROM temproles').then(async results => {
            let done = 0;
            for (let i in results) {
                if(results[i].till_date == null) continue;

                let currentdate = getCurrentDate();
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                results[i].till_date = await results[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                if ((currentdate - results[i].till_date) > 0 && currentdate[8] + currentdate[9] >= results[i].till_date[7] + results[i].till_date[7]) {
                    try {
                        done++;
                        var guild = await bot.guilds.cache.get(results[i].guild_id);
                        var user = await guild.members.fetch(results[i].user_id).then(members => members);
                        await user.roles.remove([bot.guilds.cache.get(results[i].guild_id).roles.cache.find(r => r.id === results[i].role_id)])
                        deleteEntries(results[i].infraction_id);
                    }catch(err) {
                        // CAN'T FIND USER OR USER LEFT THE SERVER
                        done -= 1;
                        if(config.debug == 'true') console.log(err);
                    }
                }
            }
            database.close();
            console.log(`Check Temproles finished. ${done} roles removed`)
        }).catch(err => {
            log.fatal(err);
            if(config.debug == 'true') console.log(err);
            database.close();
        });
    }, config.defaultCheckTemprolesTimer);
}

module.exports = {checkTemproles}