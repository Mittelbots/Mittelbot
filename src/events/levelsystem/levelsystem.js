const lvlconfig = require('../../assets/json/levelsystem/levelsystem.json');
const { Database } = require('../../db/db');

const database = new Database();

async function gainXP(message) {
    if(message.author.bot) return;

    database.query(`SELECT xp FROM ${message.guild.id}_guild_level WHERE user_id = ?`, [message.author.id]).then(async res => {
        if(res.length > 0) {
            let currentxp = await res[0].xp;

            var newxp = generateXP(currentxp);


            database.query(`UPDATE ${message.guild.id}_guild_level SET xp = ? WHERE user_id = ?`, [newxp, message.author.id]).catch(err => {
                console.log(err);
            });
        }else {
            database.query(`INSERT INTO ${message.guild.id}_guild_level (user_id, xp) VALUES (?, ?)`, [message.author.id, 10]);
        }
    }).catch(err => {
        console.log(err);
    });

    return;
}

function generateXP(currentxp) {
    const randomNumber = Math.floor(Math.random() * 30) + 1;

    currentxp = Number(currentxp) + Number(randomNumber);

    return currentxp;
}

module.exports = {gainXP};