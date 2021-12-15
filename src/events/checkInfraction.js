const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const { insertDataToClosedInfraction } = require('../../utils/functions/insertDataToDatabase');
const {
    database
} = require('../db/db');

async function deleteEntries(infraction) {
    try {
        insertDataToClosedInfraction(infraction.user_id, infraction.mod_id, infraction.mute, infraction.ban, 0, 0, infraction.till_date, infraction.reason, infraction.infraction_id);
        database.query('DELETE FROM open_infractions WHERE infraction_id = ?', [infraction.infraction_id], async (err) => { if(err) console.log(err) })
    }catch(err) {console.log(err)}
}

function checkInfractions(bot) {
    setInterval(() => {
        database.query(`SELECT * FROM open_infractions`, async (err, results) => {
            if(err) {
                console.log(`${config.errormessages.databasequeryerror}`, err)
            }
            let done = 0;
            for(let i in results) {
                if(results[i].till_date == null) continue;

                //Member can be unmuted
                let currentdate = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                results[i].till_date = results[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                
                if ((currentdate - results[i].till_date) > 0) {
                    if(results[i].mute) {
                        try {
                            done++;

                            try {
                                var guild = await bot.guilds.cache.get(config.DISCORD_GUILD_ID);
                                var user;
                                
                                user = await guild.members.fetch(results[i].user_id).then(members => members);
                            }catch(err) {
                                //Member left or got kicked
                                deleteEntries(results[i]);
                                continue;
                            }
                            
                            try {
                                await user.roles.remove([bot.guilds.cache.get(config.DISCORD_GUILD_ID).roles.cache.find(role => role.name === "Muted").id])
                                var Embed = new MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(`**Member unmuted!**`)
                                .addField(`Moderator`, `<@${bot.user.id}>`)
                                .addField(`Member`, `<@${results[i].user_id}> (${results[i].user_id})`)
                                .addField(`Reason`, `Auto`)
                                .setTimestamp();
                                await user.send({embeds: [Embed]});

                                deleteEntries(results[i]);
                            }catch(err) {
                                console.log(err);
                            }
                        }catch(err) {
                            console.log(err);
                        }
                    }else {
                        done++;
                        try {
                            await bot.guilds.cache.get(config.DISCORD_GUILD_ID).members.unban(`${results[i].user_id}`, `Auto`)
                            deleteEntries(results[i]);
                        }catch(err) {
                            //Unknown ban
                            deleteEntries(results[i]);
                        }
                    }
                }
            }
            console.log(`Check Infraction done. ${done} infractions removed!`, new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'}))
        })
    }, config.defaultCheckInfractionTimer);
}

module.exports = {checkInfractions}