const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const {
    database
} = require('../db/db');

function checkInfractions(bot) {
    setInterval(() => {
        database.query(`SELECT * FROM open_infractions`, async (err, results) => {
            if(err) {
                console.log(`${config.errormessages.databasequeryerror}`, err)
            }
            let done = 0;
            for(let i in results) {

                if(results[i].till_date == '') continue;

                //Member can be unmuted
                let currentdate = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                results[i].till_date = results[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                
                if ((currentdate - results[i].till_date) > 0) {
                    try {
                        done++;

                        var modtype = '';
                        var guild = await bot.guilds.cache.get(config.DISCORD_GUILD_ID);
                        var user;
                        
                        user = await guild.members.fetch(results[i].user_id).then(members => members);
                        
                        try {
                            if(results[i].mute) {
                                modtype = 'unmuted'
                                await user.roles.remove([bot.guilds.cache.get(config.DISCORD_GUILD_ID).roles.cache.find(role => role.name === "Muted").id])
                            }else if(results[i].ban) {
                                modtype = 'unbanned';
                                await bot.guilds.cache.get(config.DISCORD_GUILD_ID).unban(`${user}`, `Auto`)
                            }else {
                                console.log('Something went RLY RLY RLY WRONG.. NO MUTE OR BAN IS GIVEN!!!!!')
                            }

                            var Embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`**Member ${modtype}!**`)
                            .addField(`Moderator`, `${bot.user.id}`)
                            .addField(`Member`, `<@${results[i].user_id}> (${results[i].user_id})`)
                            .addField(`Reason`, `Auto`)
                            .setTimestamp();
                            await user.send({embeds: [Embed]});

                            await database.query('DELETE FROM open_infractions WHERE id = ?', [results[i].id], async (err) => { if(err) console.log(err) })
                        }catch(err) {
                            console.log(err);
                        }
                    }catch(err) {
                        console.log(err);
                    }
                }
            }
            console.log(`Check Infraction done. ${done} infractions removed!`, new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'}))
        })
    }, config.defaultCheckInfractionTimer);
}

module.exports = {checkInfractions}