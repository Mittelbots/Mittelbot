const lvlconfig = require('../../assets/json/levelsystem/levelsystem.json');
const { Database } = require('../../db/db');

const database = new Database();

async function gainXP(message) {
    if(message.author.bot) return;

    database.query(`SELECT xp, multiplier FROM ${message.guild.id}_guild_level WHERE user_id = ?`, [message.author.id]).then(async res => {
        if(res.length > 0) {
            let currentxp = await res[0].xp;
            let multiplier = await res[0].multiplier;
            var newxp;
            if(multiplier == '1') {
                newxp = Number(currentxp) * 2;
            }else {
                newxp = currentxp * multiplier;
            }

            newxp = Number(currentxp) + Number(newxp);

            if(isNaN(newxp)) return;

            database.query(`UPDATE ${message.guild.id}_guild_level SET xp = ? WHERE user_id = ?`, [newxp, message.author.id]).catch(err => {
                console.log(err);
            });
        }else {
            database.query(`INSERT INTO ${message.guild.id}_guild_level (user_id, xp, multiplier) VALUES (?, ?, ?)`, [message.author.id, 10, Number(lvlconfig.multiplier)]);
        }
    }).catch(err => {
        console.log(err);
    });
}

module.exports = {gainXP};