const config = require('../../src/assets/json/_config/config.json');
<<<<<<< HEAD
const { Temproles } = require('../../utils/functions/data/Temproles');
=======
const {
    getCurrentDate
} = require("../../utils/functions/getCurrentDate");
const { getAllTemproles, deleteFromTemproles } = require('../../utils/functions/data/temproles');
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f


module.exports.checkTemproles = async (bot) => {
    console.info("🔎📜 CheckTemproles handler started");
    setInterval(async () => {
<<<<<<< HEAD
        const results = await Temproles.getAll();
=======

        var results = await getAllTemproles();
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

        let done = 0;
        for (let i in results) {
            if (results[i].till_date == null) continue;

<<<<<<< HEAD
            const currentdate = new Date().getTime();
            const till_date = results[i].till_date.getTime();

            const currentYear = new Date().getFullYear();
            const infYear = results[i].till_date.getFullYear();
            if (currentdate - till_date <= 0 && currentYear <= infYear) {
                try {
                    done++;
                    const guild = await bot.guilds.cache.get(results[i].guild_id);
                    const user = await guild.members
                        .fetch(results[i].user_id)
                        .then((members) => members);
                    await user.roles
                        .remove([
                            bot.guilds.cache
                                .get(results[i].guild_id)
                                .roles.cache.find((r) => r.id === results[i].role_id),
                        ])
                        .catch((err) => {});
                } catch (err) {}
                await Temproles.delete(results[i].infraction_id);
=======
            let currentdate = getCurrentDate({timestamp: null});
            currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
            results[i].till_date = await results[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
            if ((currentdate - results[i].till_date) > 0 && currentdate[8] + currentdate[9] >= results[i].till_date[7] + results[i].till_date[7]) {
                try {
                    done++;
                    var guild = await bot.guilds.cache.get(results[i].guild_id);
                    var user = await guild.members.fetch(results[i].user_id).then(members => members);
                    await user.roles.remove([bot.guilds.cache.get(results[i].guild_id).roles.cache.find(r => r.id === results[i].role_id)]).catch(err => {});
                    await deleteFromTemproles({inf_id: results[i].infraction_id});
                } catch (err) {
                    // CAN'T FIND USER OR USER LEFT THE SERVER
                    done -= 1;
                    if (JSON.parse(process.env.DEBUG)) console.log(err);
                }
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
            }
        }
        console.info(`Check Temproles finished. ${done} roles removed`)
    }, config.defaultCheckTemprolesTimer);
}